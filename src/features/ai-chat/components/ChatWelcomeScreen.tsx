import { Bot, Sparkles, Calendar, Users, Pill, FileText } from 'lucide-react';

interface ChatWelcomeScreenProps {
  onSuggestedQuery: (query: string) => void;
}

const suggestedQueries = [
  {
    icon: Calendar,
    title: "Today's Appointments",
    query: "Show me today's appointments",
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Find Patient',
    query: 'Search for a patient by name or MRN',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Pill,
    title: 'Recent Prescriptions',
    query: 'Show recent prescriptions',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: FileText,
    title: 'Database Schema',
    query: 'What tables are available in the database?',
    color: 'from-emerald-500 to-teal-500',
  },
];

export function ChatWelcomeScreen({ onSuggestedQuery }: ChatWelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      {/* Hero section */}
      <div className="text-center mb-10">
        <div className="relative inline-block mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl">
            <Bot className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-3">
          EHR AI Assistant
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Your intelligent healthcare companion. Ask me about patients, appointments, 
          prescriptions, or any data in your EHR system.
        </p>
      </div>

      {/* Suggested queries */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Try asking</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestedQueries.map((item) => (
            <button
              key={item.title}
              onClick={() => onSuggestedQuery(item.query)}
              className="group relative overflow-hidden rounded-xl border bg-card p-4 text-left transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/50"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.query}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Capabilities hint */}
      <div className="mt-10 text-center">
        <p className="text-xs text-muted-foreground/60">
          I can help you manage patients, schedule appointments, view prescriptions, 
          and query the database. Just ask!
        </p>
      </div>
    </div>
  );
}
