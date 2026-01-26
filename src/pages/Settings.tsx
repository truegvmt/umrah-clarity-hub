import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, LogOut, ChevronDown, ChevronUp, Shield, Check, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { auditService } from '@/services/auditService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { user, signOut } = useAuth();
  
  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Debug section state
  const [debugOpen, setDebugOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '');
      
      // Log page view
      auditService.logPageView(user.id, user.email || '', 'Settings');
    }
  }, [user]);

  // Password validation
  const passwordStrength = (pwd: string): { score: number; label: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, label: t('settings.weak') };
    if (score <= 2) return { score, label: t('settings.fair') };
    if (score <= 3) return { score, label: t('settings.good') };
    return { score, label: t('settings.strong') };
  };

  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const strength = passwordStrength(newPassword);

  // Email validation
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!isValidEmail(email)) {
      toast({
        title: t('settings.error'),
        description: t('settings.invalidEmail'),
        variant: 'destructive',
      });
      return;
    }

    setProfileLoading(true);
    try {
      const updates: { email?: string; data?: { display_name: string } } = {};
      
      if (email !== user.email) {
        updates.email = email;
      }
      
      updates.data = { display_name: displayName };

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      await auditService.log(user.id, user.email || '', 'UPDATE_PROFILE', 'user', user.id, {
        displayName,
        emailChanged: email !== user.email,
      });

      toast({
        title: t('settings.profileUpdated'),
        description: t('settings.profileUpdatedDesc'),
      });
    } catch (error) {
      toast({
        title: t('settings.error'),
        description: error instanceof Error ? error.message : t('settings.updateFailed'),
        variant: 'destructive',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!passwordsMatch) {
      toast({
        title: t('settings.error'),
        description: t('settings.passwordMismatch'),
        variant: 'destructive',
      });
      return;
    }

    if (strength.score < 2) {
      toast({
        title: t('settings.error'),
        description: t('settings.passwordTooWeak'),
        variant: 'destructive',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      await auditService.log(user.id, user.email || '', 'CHANGE_PASSWORD', 'auth', user.id);

      toast({
        title: t('settings.passwordChanged'),
        description: t('settings.passwordChangedDesc'),
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: t('settings.error'),
        description: error instanceof Error ? error.message : t('settings.passwordChangeFailed'),
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (!user) return;
    
    setLoggingOut(true);
    try {
      await auditService.logLogout(user.id, user.email || '');
      await signOut();
      navigate('/');
    } catch {
      toast({
        title: t('settings.error'),
        description: t('settings.logoutFailed'),
        variant: 'destructive',
      });
    } finally {
      setLoggingOut(false);
    }
  };

  // Session info
  const getSessionExpiry = (): string => {
    try {
      const session = JSON.parse(localStorage.getItem('sb-session') || '{}');
      if (session.expires_at) {
        const expiryDate = new Date(session.expires_at * 1000);
        const now = new Date();
        const diffMs = expiryDate.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffMs < 0) return t('settings.sessionExpired');
        if (diffHours < 1) return `${diffMinutes} ${t('settings.minutesRemaining')}`;
        return `${diffHours}h ${diffMinutes}m ${t('settings.remaining')}`;
      }
    } catch {
      // Ignore
    }
    return t('settings.sessionActive');
  };

  // Environment check
  const envVars = {
    supabaseUrl: Boolean(import.meta.env.VITE_SUPABASE_URL),
    supabaseKey: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY),
    logServer: Boolean(import.meta.env.VITE_LOG_SERVER_URL),
    openaiKey: Boolean(import.meta.env.VITE_OPENAI_API_KEY),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              if (user) {
                auditService.logNavigation(user.id, user.email || '', '/settings', '/dashboard');
              }
              navigate('/dashboard');
            }}
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t('settings.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <User className="h-5 w-5 text-primary" />
              {t('settings.profile')}
            </CardTitle>
            <CardDescription>{t('settings.profileDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('settings.displayName')}</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('settings.displayNamePlaceholder')}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={isRTL ? 'text-right' : ''}
                />
                {email && !isValidEmail(email) && (
                  <p className="text-xs text-destructive">{t('settings.invalidEmail')}</p>
                )}
              </div>
              <Button type="submit" disabled={profileLoading || !isValidEmail(email)}>
                {profileLoading ? t('settings.saving') : t('settings.saveChanges')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Lock className="h-5 w-5 text-primary" />
              {t('settings.changePassword')}
            </CardTitle>
            <CardDescription>{t('settings.changePasswordDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('settings.currentPassword')}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={isRTL ? 'text-right pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`absolute top-0 h-full ${isRTL ? 'left-0' : 'right-0'}`}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={isRTL ? 'text-right pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`absolute top-0 h-full ${isRTL ? 'left-0' : 'right-0'}`}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {newPassword && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          strength.score <= 1 ? 'bg-destructive w-1/5' :
                          strength.score <= 2 ? 'bg-orange-500 w-2/5' :
                          strength.score <= 3 ? 'bg-yellow-500 w-3/5' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('settings.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={isRTL ? 'text-right' : ''}
                />
                {confirmPassword && (
                  <div className={`flex items-center gap-1 text-xs ${passwordsMatch ? 'text-green-600' : 'text-destructive'}`}>
                    {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {passwordsMatch ? t('settings.passwordsMatch') : t('settings.passwordsDontMatch')}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={passwordLoading || !passwordsMatch || strength.score < 2}
              >
                {passwordLoading ? t('settings.updating') : t('settings.updatePassword')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {loggingOut ? t('settings.loggingOut') : t('auth.signOut')}
            </Button>
          </CardContent>
        </Card>

        {/* Debug Section (Collapsible) */}
        <Collapsible open={debugOpen} onOpenChange={setDebugOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CardTitle className={`flex items-center gap-2 text-base ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    {t('settings.developerDebug')}
                  </CardTitle>
                  {debugOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">{t('settings.environmentVars')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-muted-foreground">Supabase URL</span>
                      <Badge variant={envVars.supabaseUrl ? 'default' : 'secondary'}>
                        {envVars.supabaseUrl ? '[set]' : '[not set]'}
                      </Badge>
                    </div>
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-muted-foreground">Supabase Key</span>
                      <Badge variant={envVars.supabaseKey ? 'default' : 'secondary'}>
                        {envVars.supabaseKey ? '[set]' : '[not set]'}
                      </Badge>
                    </div>
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-muted-foreground">Log Server URL</span>
                      <Badge variant={envVars.logServer ? 'default' : 'secondary'}>
                        {envVars.logServer ? '[set]' : '[not set]'}
                      </Badge>
                    </div>
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-muted-foreground">OpenAI Key</span>
                      <Badge variant={envVars.openaiKey ? 'default' : 'secondary'}>
                        {envVars.openaiKey ? '[set]' : '[not set]'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">{t('settings.sessionInfo')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-muted-foreground">{t('settings.sessionStatus')}</span>
                      <Badge variant={isSupabaseConfigured ? 'default' : 'secondary'}>
                        {getSessionExpiry()}
                      </Badge>
                    </div>
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-muted-foreground">{t('settings.userId')}</span>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">
                        {user?.id?.slice(0, 8) || 'N/A'}...
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </main>
    </div>
  );
};

export default Settings;
