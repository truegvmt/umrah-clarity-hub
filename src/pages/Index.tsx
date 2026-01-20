import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Blueprint } from '@/components/landing/Blueprint';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Blueprint />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
