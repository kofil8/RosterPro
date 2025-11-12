interface StatCardProps {
  number: string;
  label: string;
}

function StatCard({ number, label }: StatCardProps) {
  return (
    <div className='text-center'>
      <div className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2'>
        {number}
      </div>
      <div className='text-gray-600 font-medium'>{label}</div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto'>
          <StatCard number='500+' label='Active Companies' />
          <StatCard number='10K+' label='Team Members' />
          <StatCard number='50K+' label='Shifts Scheduled' />
          <StatCard number='99.9%' label='Uptime' />
        </div>
      </div>
    </section>
  );
}

