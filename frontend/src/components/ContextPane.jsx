import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink, BookOpen, AlertTriangle, TrendingUp, FileText, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function ContextPane({ activeTab, patientId, onToggleCollapse, isCollapsed }) {
  
  // Context cards for each tab
  const getContextCards = () => {
    switch (activeTab) {
      case 'diagnosis':
        return [
          {
            id: 'guidelines',
            title: 'NCCN Guidelines',
            icon: <BookOpen className="h-4 w-4" />,
            content: (
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm text-cacao/70">Recommended for this case:</p>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-auto p-2">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Breast Cancer v4.2023
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-auto p-2">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Genetic Testing v2.2023
                  </Button>
                </div>
              </div>
            )
          },
          {
            id: 'mutations',
            title: 'Actionable Mutations',
            icon: <AlertTriangle className="h-4 w-4" />,
            content: (
              <div className="space-y-2">
                <Badge className="bg-clay/20 text-clay">BRCA1 - Pathogenic</Badge>
                <Badge className="bg-saffron/20 text-saffron">TP53 - VUS</Badge>
                <p className="text-xs text-cacao/60 mt-2">
                  2 actionable variants detected. Consider PARP inhibitor therapy.
                </p>
              </div>
            )
          }
        ]

      case 'treatment':
        return [
          {
            id: 'interactions',
            title: 'Drug Interactions',
            icon: <AlertTriangle className="h-4 w-4" />,
            content: (
              <div className="space-y-2">
                <div className="text-xs text-cacao/70">
                  <p className="font-medium text-clay">⚠️ 1 Major Interaction</p>
                  <p className="mt-1">Doxorubicin + Trastuzumab</p>
                  <p className="text-xs">Monitor cardiac function closely</p>
                </div>
              </div>
            )
          },
          {
            id: 'survival',
            title: 'Survival Curves',
            icon: <TrendingUp className="h-4 w-4" />,
            content: (
              <div className="space-y-2">
                <div className="h-20 bg-sage/10 rounded border-2 border-dashed border-sage/30 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-sage/60" />
                </div>
                <p className="text-xs text-cacao/60">5-year OS: 87% with current regimen</p>
              </div>
            )
          }
        ]

      case 'imaging':
        return [
          {
            id: 'staging',
            title: 'TNM Staging',
            icon: <FileText className="h-4 w-4" />,
            content: (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="font-medium">T2</p>
                    <p className="text-cacao/60">Primary</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">N1</p>
                    <p className="text-cacao/60">Nodes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">M0</p>
                    <p className="text-cacao/60">Mets</p>
                  </div>
                </div>
                <Badge className="bg-saffron/20 text-saffron w-full text-center">Stage IIB</Badge>
              </div>
            )
          }
        ]

      case 'comms':
        return [
          {
            id: 'reading-level',
            title: 'Reading Level',
            icon: <BarChart3 className="h-4 w-4" />,
            content: (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Level:</span>
                  <Badge className="bg-sage/20 text-sage">Grade 8</Badge>
                </div>
                <div className="w-full bg-almond rounded-full h-2">
                  <div className="bg-sage h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-cacao/60">Appropriate for most patients</p>
              </div>
            )
          },
          {
            id: 'consent',
            title: 'Consent Forms',
            icon: <FileText className="h-4 w-4" />,
            content: (
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <FileText className="h-3 w-3 mr-2" />
                  Treatment Consent PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <FileText className="h-3 w-3 mr-2" />
                  Research Participation
                </Button>
              </div>
            )
          }
        ]

      default:
        return []
    }
  }

  const contextCards = getContextCards()

  return (
    <div className="h-full relative">
      {/* Collapse Toggle */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8 rounded-full bg-almond hover:bg-sage/10"
          aria-label={isCollapsed ? "Expand context pane" : "Collapse context pane"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-sage" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-sage" />
          )}
        </Button>
      </div>

      {/* Context Cards */}
      <div className="p-6 pt-16 space-y-4 h-full overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {contextCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card className="bg-parchment/50 border-almond shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-cacao flex items-center gap-2">
                      {card.icon}
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {card.content}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Empty state for tabs without context */}
            {contextCards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-sage/60" />
                </div>
                <p className="text-sm text-cacao/60">
                  No context cards available for this tab
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
} 