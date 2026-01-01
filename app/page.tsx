/**
 * Landing Page
 * 
 * Comprehensive payment company landing page with modern animations
 * This is the public-facing homepage with multiple sections
 */

'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TextReveal } from '@/components/ui/text-reveal';
import { CountingNumber } from '@/components/ui/counting-number';
import { motion, useInView } from 'motion/react';
import {
  ArrowRight,
  CreditCard,
  Shield,
  Zap,
  Globe,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Users,
  BarChart3,
  Clock,
  Wallet,
  Award,
  Code,
  Server,
  HeadphonesIcon,
  Network,
  UserCheck,
  Star,
  Quote,
  LogIn,
  Rocket,
} from 'lucide-react';

function AnimatedCard({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FloatingIllustration({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -20, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <img src={src} alt={alt} className="w-full h-auto" />
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <CreditCard className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Pay4Tech
            </span>
          </motion.div>
          <div className="flex items-center gap-4">
            <Link href="/docs">
              <Button variant="ghost" size="sm" className="transition-all hover:scale-105">
                <BookOpen className="h-4 w-4 mr-2" />
                Docs
              </Button>
            </Link>
            <Link href="/signin">
              <Button variant="ghost" size="sm" className="transition-all hover:scale-105 gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="transition-all hover:scale-105 hover:shadow-lg gap-2">
                <Rocket className="h-4 w-4" />
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="w-full">
        {/* Hero Section */}
        <section ref={heroRef} className="relative overflow-hidden border-b">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          />
          
          {/* Floating orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
              animate={{
                x: [0, -80, 0],
                y: [0, -60, 0],
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          <div className="container mx-auto px-4 py-24 md:py-32 max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                className="max-w-4xl mx-auto lg:mx-0 text-center lg:text-left space-y-8"
                initial={{ opacity: 0, x: -50 }}
                animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 }}
                >
                  <Badge variant="outline" className="mb-4 animate-pulse">
                    <Award className="h-3 w-3 mr-2" />
                    Trusted by 10,000+ businesses worldwide
                  </Badge>
                </motion.div>
                
                <motion.h1
                  className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 }}
                >
                  <TextReveal variant="slideUp" delay={0.3}>
                    Launch Your Payment Services
                  </TextReveal>
                  <br />
                  <motion.span
                    className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ['0%', '200%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'linear',
                    }}
                    style={{
                      backgroundSize: '200%',
                    }}
                  >
                    Effortlessly
                  </motion.span>
                </motion.h1>
                
                <motion.p
                  className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto lg:mx-0 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 }}
                >
                  Pay4Tech provides a PCI DSS-compliant, white-label payment solution that simplifies 
                  launching your own payment services. Fast deployment, cost-efficient, and built for scale.
                </motion.p>
                
                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.7 }}
                >
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="gap-2 text-lg px-8 group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Get Started Free
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </Link>
                  <Link href="/docs">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 text-lg px-8 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <BookOpen className="h-5 w-5" />
                      View Documentation
                    </Button>
                  </Link>
                </motion.div>
                
                <motion.div
                  className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground flex-wrap"
                  initial={{ opacity: 0 }}
                  animate={isHeroInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.9 }}
                >
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05, x: 5 }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>No credit card required</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05, x: 5 }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>14-day free trial</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05, x: 5 }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Cancel anytime</span>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              <motion.div
                className="hidden lg:block"
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={isHeroInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <FloatingIllustration
                  src={toAbsoluteUrl('/media/svg/payments.svg')}
                  alt="Payment illustration"
                  className="w-full h-auto max-w-lg mx-auto"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b bg-muted/30 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <div className="container mx-auto px-4 py-16 max-w-7xl relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: 10000, suffix: 'K+', label: 'Active Merchants' },
                { number: 2, suffix: 'B+', prefix: '$', label: 'Processed Annually' },
                { number: 99.9, suffix: '%', label: 'Uptime SLA' },
                { number: 150, suffix: '+', label: 'Countries Supported' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.prefix}
                    <CountingNumber from={0} to={stat.number} duration={2} />
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-24 border-b relative">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-4">Key Features</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <TextReveal variant="slideUp">
                  Everything You Need to Succeed
                </TextReveal>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive payment infrastructure designed for modern businesses
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: 'PCI DSS Compliant', desc: 'Enterprise-grade security that meets the highest industry standards. Your business stays compliant with PCI DSS Level 1 certification.' },
                { icon: Code, title: 'White-Label Solution', desc: 'Fully customizable platform with your branding. Launch your payment services under your own brand with complete control.' },
                { icon: Zap, title: 'Fast Deployment', desc: 'Get your payment services up and running in days, not months. Pre-built infrastructure accelerates your time to market.' },
                { icon: TrendingUp, title: 'Cost-Efficient', desc: 'Save on development costs and resources. No need to build payment infrastructure from scratch—we\'ve done it for you.' },
                { icon: Server, title: 'Scalable Infrastructure', desc: 'Built to handle millions of transactions. Our infrastructure scales automatically with your business growth.' },
                { icon: HeadphonesIcon, title: '24/7 Tech Support', desc: 'Expert assistance available around the clock for technical and strategic support. We\'re here when you need us.' },
              ].map((feature, index) => (
                <AnimatedCard key={index} delay={index * 0.1}>
                  <Card className="border-2 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-6 relative z-10">
                      <motion.div
                        className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="h-6 w-6 text-primary" />
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Services Overview Section */}
        <section className="py-24 bg-muted/30 border-b relative">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4">Our Services</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <TextReveal variant="slideUp">
                  Complete Payment Ecosystem
                </TextReveal>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage payments, from processing to analytics
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { img: 'credit-card.svg', title: 'Payment Software', desc: 'Streamline payment processes with our efficient and secure software. Handle transactions, refunds, and settlements all in one place.', features: ['Multiple payment methods', 'Real-time processing', 'Automated reconciliation'] },
                { img: 'dashboard.svg', title: 'Infrastructure as a Service', desc: 'Scalable and reliable infrastructure to support your payment operations. Built for high availability and performance.', features: ['99.9% uptime guarantee', 'Auto-scaling architecture', 'Global CDN integration'] },
                { img: 'team.svg', title: '24/7 Tech Support', desc: 'Expert assistance available around the clock for technical and strategic support. Dedicated account managers for enterprise clients.', features: ['Expert technical team', 'Strategic consultation', 'Priority support channels'] },
              ].map((service, index) => (
                <AnimatedCard key={index} delay={index * 0.15}>
                  <Card className="bg-card h-full group hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <motion.div
                        className="mb-4 flex justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <img
                          src={toAbsoluteUrl(`/media/svg/${service.img}`)}
                          alt={service.title}
                          className="h-32 w-auto"
                        />
                      </motion.div>
                      <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                      <p className="text-muted-foreground text-base mb-6">{service.desc}</p>
                      <ul className="space-y-3">
                        {service.features.map((feature, fIndex) => (
                          <motion.li
                            key={fIndex}
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 + fIndex * 0.1 }}
                            whileHover={{ x: 5 }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 border-b relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="outline" className="mb-4">Why Choose Pay4Tech</Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <TextReveal variant="slideUp">
                    Built for Modern Payment Operations
                  </TextReveal>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Our platform provides everything you need to launch, manage, and scale 
                  your payment services efficiently.
                </p>
                <div className="space-y-6">
                  {[
                    { icon: BarChart3, title: 'Real-Time Dashboard', desc: 'Get real-time insights into transactions and merchant activity for efficient management and decision-making.' },
                    { icon: Shield, title: 'Advanced Risk Management', desc: 'Quickly identify and mitigate risks to protect your operations with AI-powered fraud detection.' },
                    { icon: Network, title: 'Seamless Integration', desc: 'Connect effortlessly with PSPs and third-party services through our comprehensive API ecosystem.' },
                    { icon: UserCheck, title: 'User Management', desc: 'Securely control user roles and permissions for platform access with granular RBAC capabilities.' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex gap-4 group"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <motion.div
                        className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <item.icon className="h-6 w-6 text-primary" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                className="hidden lg:flex items-center justify-center relative"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: 'spring' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl" />
                <img
                  src={toAbsoluteUrl('/media/svg/analytics.svg')}
                  alt="Analytics Dashboard"
                  className="w-full h-auto max-w-md relative z-10"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Visual Section */}
        <section className="py-12 border-b bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Wallet, value: '50+', label: 'Payment Methods' },
                { icon: Globe, value: '150+', label: 'Countries' },
                { icon: Clock, value: '<2s', label: 'Avg. Response' },
                { icon: Award, value: 'PCI', label: 'Level 1' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 text-center h-full group hover:border-primary transition-all duration-300">
                    <motion.div
                      className="mb-4"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className="h-8 w-8 text-primary mx-auto" />
                    </motion.div>
                    <div className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-muted/30 border-b relative">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4">Getting Started</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <TextReveal variant="slideUp">
                  Launch in Three Simple Steps
                </TextReveal>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From signup to processing payments—it's that simple
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { num: 1, title: 'Sign Up & Configure', desc: 'Create your account and customize your payment platform with your branding and business settings.' },
                { num: 2, title: 'Integrate & Connect', desc: 'Use our comprehensive APIs and SDKs to integrate with your existing systems and connect payment methods.' },
                { num: 3, title: 'Start Processing', desc: 'Go live and start processing payments. Monitor transactions in real-time through your dashboard.' },
              ].map((step, index) => (
                <AnimatedCard key={index} delay={index * 0.2}>
                  <Card className="relative border-2 h-full group hover:border-primary hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform"
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                      >
                        {step.num}
                      </motion.div>
                      <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                      <p className="text-muted-foreground text-base">{step.desc}</p>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 border-b">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4">Testimonials</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <TextReveal variant="slideUp">
                  Trusted by Industry Leaders
                </TextReveal>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what our customers have to say about Pay4Tech
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Sarah Johnson', role: 'CEO, TechPay Solutions', text: 'With Pay4Tech\'s white-label solution, we launched our payment services in record time, saving on development costs and ensuring top-notch security. The platform is intuitive and powerful.' },
                { name: 'Michael Chen', role: 'CTO, GlobalPay Inc.', text: 'The scalability and reliability of Pay4Tech\'s infrastructure has been crucial for our growth. We\'ve processed millions of transactions without a single hiccup. Highly recommended!' },
                { name: 'Emma Williams', role: 'VP Payments, FinTech Corp', text: 'Outstanding support team and comprehensive documentation. The integration was seamless, and we were up and running in days. Pay4Tech has transformed our payment operations.' },
              ].map((testimonial, index) => (
                <AnimatedCard key={index} delay={index * 0.15}>
                  <Card className="h-full group hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 + i * 0.1 }}
                            whileHover={{ scale: 1.3, rotate: 15 }}
                          >
                            <Star className="h-5 w-5 fill-primary text-primary" />
                          </motion.div>
                        ))}
                      </div>
                      <motion.div
                        className="mb-4"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + 0.2 }}
                      >
                        <Quote className="h-8 w-8 text-primary/20" />
                      </motion.div>
                      <p className="text-muted-foreground text-base mb-6">{testimonial.text}</p>
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Users className="h-5 w-5 text-primary" />
                        </motion.div>
                        <div>
                          <div className="font-semibold group-hover:text-primary transition-colors">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b relative overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(23, 184, 166, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(23, 184, 166, 0.1) 0%, transparent 50%)',
              backgroundSize: '200% 200%',
            }}
          />
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                className="order-2 lg:order-1"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: 'spring' }}
              >
                <FloatingIllustration
                  src={toAbsoluteUrl('/media/svg/success.svg')}
                  alt="Success"
                  className="w-full h-auto max-w-md mx-auto"
                />
              </motion.div>
              <motion.div
                className="text-center lg:text-left max-w-4xl lg:max-w-none order-1 lg:order-2 space-y-8"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="outline" className="mb-4">Ready to Get Started?</Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <TextReveal variant="slideUp">
                    Launch Your Payment Services Today
                  </TextReveal>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                  Join thousands of businesses that trust Pay4Tech for their payment infrastructure. 
                  Get started in minutes with our free trial—no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="gap-2 text-lg px-8 group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Start Free Trial
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </Link>
                  <Link href="/docs">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 text-lg px-8 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <BookOpen className="h-5 w-5" />
                      View Documentation
                    </Button>
                  </Link>
                </div>
                <motion.div
                  className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground flex-wrap"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.1, x: 5 }}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <motion.footer
        className="border-t bg-muted/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <motion.div
                className="flex items-center gap-2 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <CreditCard className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Pay4Tech</span>
              </motion.div>
              <p className="text-sm text-muted-foreground">
                The complete payment infrastructure solution for modern businesses.
              </p>
            </div>
            {['Product', 'Company', 'Support'].map((category, i) => (
              <div key={i}>
                <h3 className="font-semibold mb-4">{category}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/docs" className="hover:text-foreground transition-colors">
                      {category === 'Product' ? 'Documentation' : category === 'Company' ? 'Get Started' : 'Help Center'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs" className="hover:text-foreground transition-colors">
                      {category === 'Product' ? 'API Reference' : category === 'Company' ? 'Sign In' : 'Contact Us'}
                    </Link>
                  </li>
                  {category === 'Product' && (
                    <li>
                      <Link href="/docs" className="hover:text-foreground transition-colors">
                        Guides
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
          <motion.div
            className="border-t pt-8 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p>&copy; {new Date().getFullYear()} Pay4Tech. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}
