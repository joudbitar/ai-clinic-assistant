import { useState } from 'react'
import { motion } from 'framer-motion'
import { DNA, ChevronDown, ChevronRight, ExternalLink, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// Mock genomic data
const mockGenomicData = [
  {
    id: 1,
    gene: 'BRCA1',
    variant: 'c.5266dupC',
    protein: 'p.Gln1756ProfsTer74',
    classification: 'Pathogenic',
    vaf: 47.2,
    coverage: 1450,
    actionable: true,
    therapies: ['Olaparib', 'Talazoparib', 'Platinum agents'],
    guidelines: 'NCCN: Consider PARP inhibitor',
    population_frequency: 0.001,
    references: ['ClinVar: RCV000116726', 'HGMD: CM981328']
  },
  {
    id: 2,
    gene: 'TP53',
    variant: 'c.818G>A',
    protein: 'p.Arg273His',
    classification: 'VUS',
    vaf: 23.8,
    coverage: 892,
    actionable: false,
    therapies: [],
    guidelines: 'Uncertain significance - monitor',
    population_frequency: 0.0001,
    references: ['ClinVar: RCV000012345']
  },
  {
    id: 3,
    gene: 'PIK3CA',
    variant: 'c.3140A>G',
    protein: 'p.His1047Arg',
    classification: 'Pathogenic',
    vaf: 31.5,
    coverage: 1120,
    actionable: true,
    therapies: ['Alpelisib', 'Everolimus'],
    guidelines: 'FDA approved: Alpelisib for HR+ breast cancer',
    population_frequency: 0.02,
    references: ['ClinVar: RCV000123456', 'OncoKB: Oncogenic']
  },
  {
    id: 4,
    gene: 'ERBB2',
    variant: 'c.2263_2264insGCGTGC',
    protein: 'p.Ala755_Leu756insAlaVal',
    classification: 'Likely Pathogenic',
    vaf: 19.3,
    coverage: 756,
    actionable: true,
    therapies: ['Trastuzumab', 'Pertuzumab', 'T-DM1'],
    guidelines: 'HER2 exon 20 insertion - consider HER2 targeted therapy',
    population_frequency: 0.0005,
    references: ['ClinVar: RCV000654321']
  }
]

export function GenomicVariantTable({ patientId }) {
  const [expandedVariant, setExpandedVariant] = useState(null)
  const [filterActionable, setFilterActionable] = useState(false)

  const getClassificationColor = (classification) => {
    switch (classification.toLowerCase()) {
      case 'pathogenic':
        return 'bg-clay/20 text-clay border-clay/30'
      case 'likely pathogenic':
        return 'bg-saffron/20 text-saffron border-saffron/30'
      case 'vus':
      case 'uncertain significance':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'likely benign':
        return 'bg-sage/10 text-sage/70 border-sage/20'
      case 'benign':
        return 'bg-sage/20 text-sage border-sage/30'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getClassificationIcon = (classification) => {
    switch (classification.toLowerCase()) {
      case 'pathogenic':
      case 'likely pathogenic':
        return <AlertTriangle className="h-3 w-3" />
      case 'vus':
      case 'uncertain significance':
        return <HelpCircle className="h-3 w-3" />
      case 'likely benign':
      case 'benign':
        return <CheckCircle2 className="h-3 w-3" />
      default:
        return <HelpCircle className="h-3 w-3" />
    }
  }

  const filteredData = filterActionable 
    ? mockGenomicData.filter(variant => variant.actionable)
    : mockGenomicData

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-parchment border-almond p-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-clay">{mockGenomicData.filter(v => v.classification === 'Pathogenic').length}</div>
            <div className="text-xs text-cacao/60">Pathogenic</div>
          </div>
        </Card>
        <Card className="bg-parchment border-almond p-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-saffron">{mockGenomicData.filter(v => v.classification === 'VUS').length}</div>
            <div className="text-xs text-cacao/60">VUS</div>
          </div>
        </Card>
        <Card className="bg-parchment border-almond p-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-sage">{mockGenomicData.filter(v => v.actionable).length}</div>
            <div className="text-xs text-cacao/60">Actionable</div>
          </div>
        </Card>
      </div>

      {/* Variant Table */}
      <Card className="bg-parchment border-almond">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-cacao flex items-center gap-2">
              <DNA className="h-4 w-4" />
              Genomic Variants
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterActionable(!filterActionable)}
              className={`text-xs ${filterActionable ? 'bg-sage/10 border-sage/30' : ''}`}
            >
              {filterActionable ? 'Show All' : 'Actionable Only'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredData.map((variant, index) => (
              <motion.div
                key={variant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-almond rounded-lg overflow-hidden"
              >
                {/* Variant Header */}
                <div className="p-3 bg-almond/20 hover:bg-almond/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-sm text-cacao">{variant.gene}</div>
                      <Badge className={`${getClassificationColor(variant.classification)} text-xs flex items-center gap-1`}>
                        {getClassificationIcon(variant.classification)}
                        {variant.classification}
                      </Badge>
                      {variant.actionable && (
                        <Badge className="bg-sage/20 text-sage text-xs">
                          Actionable
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-cacao/60">VAF: {variant.vaf}%</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedVariant(expandedVariant === variant.id ? null : variant.id)}
                        className="h-6 w-6 p-0"
                      >
                        {expandedVariant === variant.id ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-cacao/70">
                    <div>DNA: {variant.variant}</div>
                    <div>Protein: {variant.protein}</div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedVariant === variant.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-parchment/50 border-t border-almond"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Technical Details */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-cacao">Technical Details</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-cacao/60">Coverage:</span>
                            <span className="text-cacao">{variant.coverage}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-cacao/60">Population Freq:</span>
                            <span className="text-cacao">{variant.population_frequency}%</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-medium text-xs text-cacao/80">References</h5>
                          <div className="space-y-1">
                            {variant.references.map((ref, idx) => (
                              <Button key={idx} variant="ghost" size="sm" className="h-6 text-xs justify-start p-1">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {ref}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Clinical Significance */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-cacao">Clinical Significance</h4>
                        <div className="p-3 bg-sage/10 rounded-lg">
                          <p className="text-xs text-cacao">{variant.guidelines}</p>
                        </div>

                        {variant.therapies.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-xs text-cacao/80">Potential Therapies</h5>
                            <div className="flex flex-wrap gap-2">
                              {variant.therapies.map((therapy, idx) => (
                                <Badge key={idx} className="bg-saffron/20 text-saffron text-xs">
                                  {therapy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}

            {filteredData.length === 0 && (
              <div className="text-center py-8 text-cacao/60">
                <DNA className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No variants found with current filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 