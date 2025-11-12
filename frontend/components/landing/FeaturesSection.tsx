import {
  BarChart3,
  Calendar,
  MessageSquare,
  Shield,
  Users,
  Zap,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className='group p-8 rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
      <div className='w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-blue-600 mb-5 group-hover:scale-110 transition-transform'>
        {icon}
      </div>
      <h3 className='text-xl font-bold mb-3 text-gray-900'>{title}</h3>
      <p className='text-gray-600 leading-relaxed'>{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: <Calendar className='w-6 h-6' />,
      title: "Smart Scheduling",
      description:
        "Create and publish rosters with drag-and-drop simplicity. Automatic conflict detection.",
    },
    {
      icon: <Users className='w-6 h-6' />,
      title: "Team Management",
      description:
        "Manage your team with role-based access control and detailed user profiles.",
    },
    {
      icon: <MessageSquare className='w-6 h-6' />,
      title: "Real-time Chat",
      description:
        "Built-in messaging system for seamless team communication.",
    },
    {
      icon: <BarChart3 className='w-6 h-6' />,
      title: "Analytics & Reports",
      description:
        "Comprehensive insights into your workforce and operations.",
    },
    {
      icon: <Shield className='w-6 h-6' />,
      title: "Enterprise Security",
      description:
        "Bank-level security with JWT authentication and encrypted data.",
    },
    {
      icon: <Zap className='w-6 h-6' />,
      title: "Lightning Fast",
      description:
        "Built with modern technologies for optimal performance.",
    },
  ];

  return (
    <section id='features' className='container mx-auto px-4 py-20'>
      <h2 className='text-3xl md:text-4xl font-bold text-center mb-4'>
        Everything You Need
      </h2>
      <p className='text-center text-gray-600 mb-12 max-w-2xl mx-auto'>
        Powerful features designed to streamline your workforce management and
        boost productivity.
      </p>
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}

