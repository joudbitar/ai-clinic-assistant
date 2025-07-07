import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Settings as SettingsIcon, User, Building2, Languages, Mic, Bot, Link, Bell, Shield, FileText, AlertTriangle } from 'lucide-react'

const sections = [
  { id: 'profile', label: 'User Profile', icon: User },
  { id: 'clinic', label: 'Clinic', icon: Building2 },
  { id: 'language', label: 'Language & UI', icon: Languages },
  { id: 'voice', label: 'Voice & Transcription', icon: Mic },
  { id: 'ai', label: 'AI Settings', icon: Bot },
  { id: 'integrations', label: 'Integrations', icon: Link },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]

export default function SettingsPage() {
  const navigate = useNavigate()

  // Scroll section into view
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <div className="hidden md:flex w-56 flex-col gap-1 border-r p-4 bg-background">
        <Button
          variant="ghost"
          className="justify-start mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <Separator className="mb-4" />
        {sections.map((section) => (
          <Button
            key={section.id}
            variant="ghost"
            className="justify-start"
            onClick={() => scrollToSection(section.id)}
          >
            <section.icon className="mr-2 h-4 w-4" />
            {section.label}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <ScrollArea className="h-screen">
          <div className="container max-w-3xl py-8 px-4">
            <div className="flex items-center gap-2 mb-8">
              <SettingsIcon className="h-6 w-6" />
              <h1 className="text-2xl font-semibold">Settings</h1>
            </div>

            <div className="space-y-12">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" />
                    <h2 className="text-xl font-medium">{section.label}</h2>
                  </div>
                  <Separator />
                  <div className="p-6 rounded-lg border bg-card">
                    <p className="text-muted-foreground text-center">
                      Settings for {section.label.toLowerCase()} will be implemented here.
                    </p>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      This section is coming soon!
                    </p>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
} 