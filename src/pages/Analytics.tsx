import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, TrendingUp, Users, Package, Brain, Target, Zap, Database } from "lucide-react";
import { Link } from "react-router-dom";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hippie-purple/20 via-background to-hippie-pink/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-hippie-purple/20 to-hippie-pink/20 px-4 py-2 rounded-full mb-6 border border-hippie-pink/30">
            <Database className="w-4 h-4 text-hippie-purple" />
            <span className="text-sm font-semibold">Data-Driven Intelligence</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange bg-clip-text text-transparent mb-6">
            Cuddles Analytics Platform
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform customer conversations into actionable insights. See what Cuddles collects, why it matters, and how to leverage it for business growth.
          </p>
        </div>

        {/* What We Collect Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold text-center mb-8">What Cuddles Collects</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-hippie-purple/30 shadow-lg">
              <CardHeader>
                <Brain className="w-8 h-8 text-hippie-purple mb-2" />
                <CardTitle>Customer Preferences</CardTitle>
                <CardDescription>
                  Desired effects, experience levels, consumption methods, flavor profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Effect preferences (relaxation, energy, focus)</li>
                  <li>• Experience level (beginner to expert)</li>
                  <li>• THC/CBD tolerance & preferences</li>
                  <li>• Preferred consumption methods</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-hippie-pink/30 shadow-lg">
              <CardHeader>
                <Target className="w-8 h-8 text-hippie-pink mb-2" />
                <CardTitle>Recommendation Data</CardTitle>
                <CardDescription>
                  Products recommended, conversion rates, and customer feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Products recommended per session</li>
                  <li>• Recommendation acceptance rate</li>
                  <li>• Follow-up questions asked</li>
                  <li>• Alternative suggestions explored</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-hippie-orange/30 shadow-lg">
              <CardHeader>
                <Zap className="w-8 h-8 text-hippie-orange mb-2" />
                <CardTitle>Conversation Insights</CardTitle>
                <CardDescription>
                  Customer journey, pain points, and satisfaction metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Average conversation length</li>
                  <li>• Customer sentiment analysis</li>
                  <li>• Common questions & concerns</li>
                  <li>• Satisfaction ratings</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-hippie-green/30 shadow-lg">
              <CardHeader>
                <Package className="w-8 h-8 text-hippie-green mb-2" />
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>
                  Which products are recommended most and convert best
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Top recommended products</li>
                  <li>• Recommendation-to-purchase rate</li>
                  <li>• Product pairing insights</li>
                  <li>• Inventory demand forecasting</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-hippie-yellow/30 shadow-lg">
              <CardHeader>
                <Users className="w-8 h-8 text-hippie-yellow mb-2" />
                <CardTitle>Customer Behavior</CardTitle>
                <CardDescription>
                  Usage patterns, peak times, and customer segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Peak usage times & days</li>
                  <li>• Customer segment patterns</li>
                  <li>• Repeat interaction rate</li>
                  <li>• Cross-sell opportunities</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-hippie-purple/30 shadow-lg">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-hippie-purple mb-2" />
                <CardTitle>Business Metrics</CardTitle>
                <CardDescription>
                  ROI, conversion rates, and operational efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• AI-assisted conversion rate</li>
                  <li>• Average order value impact</li>
                  <li>• Staff time saved</li>
                  <li>• Customer retention rate</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why It Matters Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold text-center mb-8">Why This Data Matters</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-hippie-purple/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-hippie-purple" />
                  Optimize Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Know exactly what products customers are looking for before they run out. Cuddles' recommendation data shows you which strains and products to stock based on real customer preferences.
                </p>
                <div className="bg-hippie-purple/10 p-4 rounded-lg border border-hippie-purple/20">
                  <p className="text-sm font-semibold mb-2">Example Insight:</p>
                  <p className="text-sm text-muted-foreground">
                    "80% of relaxation-seeking customers prefer indica strains with terpene profiles high in myrcene. Stock 30% more Blue Dream and Granddaddy Purple."
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-hippie-pink/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-hippie-pink" />
                  Understand Your Customers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Build detailed customer profiles without surveys. Every conversation reveals preferences, experience levels, and pain points your team can act on.
                </p>
                <div className="bg-hippie-pink/10 p-4 rounded-lg border border-hippie-pink/20">
                  <p className="text-sm font-semibold mb-2">Example Insight:</p>
                  <p className="text-sm text-muted-foreground">
                    "65% of your new customers are beginners looking for stress relief. Create a 'Cannabis 101' bundle targeting this segment."
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-hippie-orange/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-hippie-orange" />
                  Increase Conversions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  See which recommendations lead to purchases and which don't. Refine your product offerings and staff training based on what actually converts.
                </p>
                <div className="bg-hippie-orange/10 p-4 rounded-lg border border-hippie-orange/20">
                  <p className="text-sm font-semibold mb-2">Example Insight:</p>
                  <p className="text-sm text-muted-foreground">
                    "Customers who receive edible recommendations have 40% higher cart values. Train staff to suggest edibles for new customers."
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-hippie-green/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-hippie-green" />
                  Scale Efficiently
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Cuddles handles thousands of conversations simultaneously, learning and improving with each interaction. Your budtending expertise scales infinitely.
                </p>
                <div className="bg-hippie-green/10 p-4 rounded-lg border border-hippie-green/20">
                  <p className="text-sm font-semibold mb-2">Example Insight:</p>
                  <p className="text-sm text-muted-foreground">
                    "Cuddles handled 2,500 customer inquiries last month, saving 150 staff hours while maintaining 4.8/5 satisfaction."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How to Leverage Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold text-center mb-8">How to Leverage Cuddles Data</h2>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-hippie-purple/30 shadow-lg">
              <CardHeader>
                <CardTitle>📊 Access Your Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  View real-time analytics through your integrated dispensary dashboard. All data syncs automatically from Cuddles conversations.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Daily Reports</h4>
                    <p className="text-sm text-muted-foreground">Customer interactions, top recommendations, conversion rates</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Weekly Insights</h4>
                    <p className="text-sm text-muted-foreground">Trending products, customer segment analysis, inventory alerts</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Monthly Strategy</h4>
                    <p className="text-sm text-muted-foreground">Performance trends, growth opportunities, ROI analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-hippie-pink/30 shadow-lg">
              <CardHeader>
                <CardTitle>🎯 Set Up Automated Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get notified when important trends emerge or actions are needed:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Low Stock Alert:</strong> When a frequently recommended product is running low</li>
                  <li>• <strong>Trend Alert:</strong> When a new product or effect is gaining popularity</li>
                  <li>• <strong>Sentiment Alert:</strong> When customer satisfaction drops below threshold</li>
                  <li>• <strong>Opportunity Alert:</strong> When cross-sell opportunities are identified</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-hippie-orange/30 shadow-lg">
              <CardHeader>
                <CardTitle>🔗 Export & Integrate Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Connect Cuddles data with your existing tools:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">POS Systems</h4>
                    <p className="text-sm text-muted-foreground">Track which Cuddles recommendations result in actual purchases</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">CRM/Loyalty Programs</h4>
                    <p className="text-sm text-muted-foreground">Enrich customer profiles with preference data from conversations</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Inventory Management</h4>
                    <p className="text-sm text-muted-foreground">Automatically adjust ordering based on recommendation demand</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Marketing Platforms</h4>
                    <p className="text-sm text-muted-foreground">Create targeted campaigns based on customer segments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-hippie-green/30 shadow-lg">
              <CardHeader>
                <CardTitle>📈 Train Your Team with Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Use Cuddles data to improve your staff's product knowledge and sales techniques:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Review top-converting recommendation patterns for training</li>
                  <li>• Identify knowledge gaps based on frequently asked questions</li>
                  <li>• Share successful product pairing strategies with budtenders</li>
                  <li>• Use customer feedback to refine consultation approach</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="border-hippie-purple/30 shadow-xl bg-gradient-to-br from-hippie-purple/10 via-hippie-pink/10 to-hippie-orange/10">
            <CardHeader>
              <CardTitle className="text-3xl font-display font-bold">Ready to Unlock Your Data?</CardTitle>
              <CardDescription className="text-lg">
                See how Cuddles transforms customer conversations into business growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/schedule-demo">
                  <Button size="lg" className="bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange text-white hover:shadow-glow">
                    Schedule a Demo
                  </Button>
                </Link>
                <Link to="/investment-deck">
                  <Button size="lg" variant="outline">
                    View Investment Deck
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Analytics;