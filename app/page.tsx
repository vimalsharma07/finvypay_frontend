/**
 * Landing Page
 * 
 * Comprehensive payment company landing page
 * This is the public-facing homepage with multiple sections
 */

'use client';

import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  CreditCard,
  Shield,
  Zap,
  Globe,
  BookOpen,
  CheckCircle2,
  Lock,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  Clock,
  Wallet,
  Receipt,
  Link2,
  ArrowUpRight,
  Award,
  Code,
  Server,
  HeadphonesIcon,
  Eye,
  Network,
  UserCheck,
  Star,
  Quote,
  PlayCircle,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Pay4Tech
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs">
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Docs
              </Button>
            </Link>
            <Link href="/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
          <div className="container mx-auto px-4 py-24 md:py-32 max-w-7xl relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-4xl mx-auto lg:mx-0 text-center lg:text-left space-y-8">
              <Badge variant="outline" className="mb-4">
                <Award className="h-3 w-3 mr-2" />
                Trusted by 10,000+ businesses worldwide
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Launch Your Payment Services
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  Effortlessly
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Pay4Tech provides a PCI DSS-compliant, white-label payment solution that simplifies 
                launching your own payment services. Fast deployment, cost-efficient, and built for scale.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/signup">
                  <Button size="lg" className="gap-2 text-lg px-8">
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                    <BookOpen className="h-5 w-5" />
                    View Documentation
                  </Button>
                </Link>
              </div>
              <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Cancel anytime</span>
                </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <img
                  src={toAbsoluteUrl('/media/svg/payments.svg')}
                  alt="Payment illustration"
                  className="w-full h-auto max-w-lg mx-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-16 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Active Merchants</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">$2B+</div>
                <div className="text-sm text-muted-foreground">Processed Annually</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">150+</div>
                <div className="text-sm text-muted-foreground">Countries Supported</div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-24 border-b">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Key Features</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive payment infrastructure designed for modern businesses
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">PCI DSS Compliant</h3>
                  <p className="text-muted-foreground">
                    Enterprise-grade security that meets the highest industry standards. 
                    Your business stays compliant with PCI DSS Level 1 certification.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">White-Label Solution</h3>
                  <p className="text-muted-foreground">
                    Fully customizable platform with your branding. Launch your payment 
                    services under your own brand with complete control.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Fast Deployment</h3>
                  <p className="text-muted-foreground">
                    Get your payment services up and running in days, not months. 
                    Pre-built infrastructure accelerates your time to market.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Cost-Efficient</h3>
                  <p className="text-muted-foreground">
                    Save on development costs and resources. No need to build payment 
                    infrastructure from scratch—we've done it for you.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Server className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Scalable Infrastructure</h3>
                  <p className="text-muted-foreground">
                    Built to handle millions of transactions. Our infrastructure scales 
                    automatically with your business growth.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <HeadphonesIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">24/7 Tech Support</h3>
                  <p className="text-muted-foreground">
                    Expert assistance available around the clock for technical and 
                    strategic support. We're here when you need us.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Services Overview Section */}
        <section className="py-24 bg-muted/30 border-b">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Our Services</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Complete Payment Ecosystem
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage payments, from processing to analytics
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center">
                    <img
                      src={toAbsoluteUrl('/media/svg/credit-card.svg')}
                      alt="Payment Software"
                      className="h-32 w-auto"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Payment Software</h3>
                  <p className="text-muted-foreground text-base mb-6">
                    Streamline payment processes with our efficient and secure software. 
                    Handle transactions, refunds, and settlements all in one place.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Multiple payment methods</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Real-time processing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Automated reconciliation</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center">
                    <img
                      src={toAbsoluteUrl('/media/svg/dashboard.svg')}
                      alt="Infrastructure"
                      className="h-32 w-auto"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Infrastructure as a Service</h3>
                  <p className="text-muted-foreground text-base mb-6">
                    Scalable and reliable infrastructure to support your payment operations. 
                    Built for high availability and performance.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">99.9% uptime guarantee</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Auto-scaling architecture</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Global CDN integration</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center">
                    <img
                      src={toAbsoluteUrl('/media/svg/team.svg')}
                      alt="Tech Support"
                      className="h-32 w-auto"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">24/7 Tech Support</h3>
                  <p className="text-muted-foreground text-base mb-6">
                    Expert assistance available around the clock for technical and 
                    strategic support. Dedicated account managers for enterprise clients.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Expert technical team</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Strategic consultation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">Priority support channels</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 border-b">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4">Why Choose Pay4Tech</Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Built for Modern Payment Operations
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Our platform provides everything you need to launch, manage, and scale 
                  your payment services efficiently.
                </p>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Real-Time Dashboard</h3>
                      <p className="text-muted-foreground">
                        Get real-time insights into transactions and merchant activity 
                        for efficient management and decision-making.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Advanced Risk Management</h3>
                      <p className="text-muted-foreground">
                        Quickly identify and mitigate risks to protect your operations 
                        with AI-powered fraud detection.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Network className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Seamless Integration</h3>
                      <p className="text-muted-foreground">
                        Connect effortlessly with PSPs and third-party services through 
                        our comprehensive API ecosystem.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">User Management</h3>
                      <p className="text-muted-foreground">
                        Securely control user roles and permissions for platform access 
                        with granular RBAC capabilities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src={toAbsoluteUrl('/media/svg/analytics.svg')}
                  alt="Analytics Dashboard"
                  className="w-full h-auto max-w-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Visual Section */}
        <section className="py-12 border-b bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-6 text-center">
                <Wallet className="h-8 w-8 text-primary mb-4 mx-auto" />
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Payment Methods</div>
              </Card>
              <Card className="p-6 text-center">
                <Globe className="h-8 w-8 text-primary mb-4 mx-auto" />
                <div className="text-3xl font-bold mb-2">150+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </Card>
              <Card className="p-6 text-center">
                <Clock className="h-8 w-8 text-primary mb-4 mx-auto" />
                <div className="text-3xl font-bold mb-2">&lt;2s</div>
                <div className="text-sm text-muted-foreground">Avg. Response</div>
              </Card>
              <Card className="p-6 text-center">
                <Award className="h-8 w-8 text-primary mb-4 mx-auto" />
                <div className="text-3xl font-bold mb-2">PCI</div>
                <div className="text-sm text-muted-foreground">Level 1</div>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-muted/30 border-b">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Getting Started</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Launch in Three Simple Steps
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From signup to processing payments—it's that simple
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="relative border-2">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Sign Up & Configure</h3>
                  <p className="text-muted-foreground text-base">
                    Create your account and customize your payment platform with your branding 
                    and business settings.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative border-2">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Integrate & Connect</h3>
                  <p className="text-muted-foreground text-base">
                    Use our comprehensive APIs and SDKs to integrate with your existing systems 
                    and connect payment methods.
                  </p>
                </CardContent>
              </Card>

              <Card className="relative border-2">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Start Processing</h3>
                  <p className="text-muted-foreground text-base">
                    Go live and start processing payments. Monitor transactions in real-time 
                    through your dashboard.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 border-b">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Testimonials</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Trusted by Industry Leaders
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what our customers have to say about Pay4Tech
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <div className="mb-4">
                    <Quote className="h-8 w-8 text-primary/20" />
                  </div>
                  <p className="text-muted-foreground text-base mb-6">
                    With Pay4Tech's white-label solution, we launched our payment services 
                    in record time, saving on development costs and ensuring top-notch security. 
                    The platform is intuitive and powerful.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Sarah Johnson</div>
                      <div className="text-sm text-muted-foreground">CEO, TechPay Solutions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <div className="mb-4">
                    <Quote className="h-8 w-8 text-primary/20" />
                  </div>
                  <p className="text-muted-foreground text-base mb-6">
                    The scalability and reliability of Pay4Tech's infrastructure has been 
                    crucial for our growth. We've processed millions of transactions without 
                    a single hiccup. Highly recommended!
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Michael Chen</div>
                      <div className="text-sm text-muted-foreground">CTO, GlobalPay Inc.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <div className="mb-4">
                    <Quote className="h-8 w-8 text-primary/20" />
                  </div>
                  <p className="text-muted-foreground text-base mb-6">
                    Outstanding support team and comprehensive documentation. The integration 
                    was seamless, and we were up and running in days. Pay4Tech has transformed 
                    our payment operations.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Emma Williams</div>
                      <div className="text-sm text-muted-foreground">VP Payments, FinTech Corp</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <img
                  src={toAbsoluteUrl('/media/svg/success.svg')}
                  alt="Success"
                  className="w-full h-auto max-w-md mx-auto"
                />
              </div>
              <div className="text-center lg:text-left max-w-4xl lg:max-w-none order-1 lg:order-2 space-y-8">
                <Badge variant="outline" className="mb-4">Ready to Get Started?</Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Launch Your Payment Services Today
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                  Join thousands of businesses that trust Pay4Tech for their payment infrastructure. 
                  Get started in minutes with our free trial—no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="gap-2 text-lg px-8">
                      Start Free Trial
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/docs">
                    <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                      <BookOpen className="h-5 w-5" />
                      View Documentation
                    </Button>
                  </Link>
                </div>
                <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Pay4Tech</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The complete payment infrastructure solution for modern businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Guides
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/signup" className="hover:text-foreground transition-colors">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link href="/signin" className="hover:text-foreground transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Pay4Tech. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
