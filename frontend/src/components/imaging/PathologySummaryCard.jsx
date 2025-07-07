import { motion } from 'framer-motion'
import { Microscope, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Mock pathology data
const mockPathologyData = {
  biopsyDate: '2024-01-22',
  pathologist: 'Dr. Martinez',
  specimen: 'Core needle biopsy, left breast',
  diagnosis: {
    primary: 'Invasive Ductal Carcinoma',
    grade: 'Grade 2',
    size: '2.1 cm',
    margins: 'Clear (>2mm)',
    lymphovascular: 'Present'
  },
  markers: {
    er: { status: 'Positive', percentage: 95 },
    pr: { status: 'Positive', percentage: 80 },
    her2: { status: 'Negative', score: '1+' },
    ki67: { percentage: 25 }
  },
  staging: {
    t: 'T2',
    n: 'N1',
    m: 'M0',
    overall: 'Stage IIB'
  },
  molecularProfile: [
    { gene: 'BRCA1', status: 'Mutation detected', significance: 'Pathogenic' },
    { gene: 'TP53', status: 'Wild type', significance: 'Normal' },
    { gene: 'PIK3CA', status: 'Mutation detected', significance: 'Pathogenic' }
  ],
  recommendations: [
    'Consider neoadjuvant chemotherapy',
    'Genetic counseling recommended',
    'Multidisciplinary team discussion',
    'Monitor cardiac function if anthracyclines used'
  ]
}

export function PathologySummaryCard({ patientId }) {
  const getMarkerColor = (status, percentage) => {
    if (status === 'Positive' || percentage > 0) {
      return 'bg-sage/20 text-sage'
    } else if (status === 'Negative') {
      return 'bg-gray-100 text-gray-600'
    }
    return 'bg-saffron/20 text-saffron'
  }

  const getSignificanceColor = (significance) => {
    switch (significance.toLowerCase()) {
      case 'pathogenic':
        return 'bg-clay/20 text-clay'
      case 'normal':
        return 'bg-sage/20 text-sage'
      case 'uncertain':
        return 'bg-saffron/20 text-saffron'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStageColor = (stage) => {
    if (stage.includes('I')) return 'bg-sage/20 text-sage'
    if (stage.includes('II')) return 'bg-saffron/20 text-saffron'
    if (stage.includes('III') || stage.includes('IV')) return 'bg-clay/20 text-clay'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-4">
      {/* Main Pathology Report */}
      <Card className="bg-parchment border-almond">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-cacao flex items-center gap-2">
              <Microscope className="h-4 w-4" />
              Pathology Report
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-sage/20 text-sage">Final Report</Badge>
              <Button variant="outline" size="sm">
                <FileText className="h-3 w-3 mr-1" />
                View Full Report
              </Button>
            </div>
          </div>
          <div className="text-sm text-cacao/60">
            {mockPathologyData.specimen} • {mockPathologyData.biopsyDate} • {mockPathologyData.pathologist}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Primary Diagnosis */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-cacao">Primary Diagnosis</h3>
              <div className="space-y-3">
                <div className="p-3 bg-almond/30 rounded-lg">
                  <h4 className="font-medium text-sm text-cacao mb-2">{mockPathologyData.diagnosis.primary}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-cacao/60">Grade:</span>
                      <p className="text-cacao font-medium">{mockPathologyData.diagnosis.grade}</p>
                    </div>
                    <div>
                      <span className="text-cacao/60">Size:</span>
                      <p className="text-cacao font-medium">{mockPathologyData.diagnosis.size}</p>
                    </div>
                    <div>
                      <span className="text-cacao/60">Margins:</span>
                      <p className="text-cacao font-medium">{mockPathologyData.diagnosis.margins}</p>
                    </div>
                    <div>
                      <span className="text-cacao/60">LVI:</span>
                      <p className="text-cacao font-medium">{mockPathologyData.diagnosis.lymphovascular}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staging */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-cacao">TNM Staging</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-almond/20 rounded">
                    <div className="font-medium text-sm text-cacao">{mockPathologyData.staging.t}</div>
                    <div className="text-xs text-cacao/60">Tumor</div>
                  </div>
                  <div className="text-center p-2 bg-almond/20 rounded">
                    <div className="font-medium text-sm text-cacao">{mockPathologyData.staging.n}</div>
                    <div className="text-xs text-cacao/60">Nodes</div>
                  </div>
                  <div className="text-center p-2 bg-almond/20 rounded">
                    <div className="font-medium text-sm text-cacao">{mockPathologyData.staging.m}</div>
                    <div className="text-xs text-cacao/60">Mets</div>
                  </div>
                  <div className="text-center p-2 bg-sage/10 rounded">
                    <div className="font-medium text-sm text-sage">{mockPathologyData.staging.overall}</div>
                    <div className="text-xs text-sage/70">Overall</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Biomarkers */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-cacao">Biomarkers</h3>
              <div className="space-y-2">
                {/* ER */}
                <div className="flex items-center justify-between p-3 bg-almond/20 rounded-lg">
                  <div>
                    <span className="font-medium text-sm text-cacao">Estrogen Receptor (ER)</span>
                    <p className="text-xs text-cacao/60">Nuclear staining</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getMarkerColor(mockPathologyData.markers.er.status, mockPathologyData.markers.er.percentage)}>
                      {mockPathologyData.markers.er.status}
                    </Badge>
                    <p className="text-xs text-cacao/60 mt-1">{mockPathologyData.markers.er.percentage}%</p>
                  </div>
                </div>

                {/* PR */}
                <div className="flex items-center justify-between p-3 bg-almond/20 rounded-lg">
                  <div>
                    <span className="font-medium text-sm text-cacao">Progesterone Receptor (PR)</span>
                    <p className="text-xs text-cacao/60">Nuclear staining</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getMarkerColor(mockPathologyData.markers.pr.status, mockPathologyData.markers.pr.percentage)}>
                      {mockPathologyData.markers.pr.status}
                    </Badge>
                    <p className="text-xs text-cacao/60 mt-1">{mockPathologyData.markers.pr.percentage}%</p>
                  </div>
                </div>

                {/* HER2 */}
                <div className="flex items-center justify-between p-3 bg-almond/20 rounded-lg">
                  <div>
                    <span className="font-medium text-sm text-cacao">HER2</span>
                    <p className="text-xs text-cacao/60">Immunohistochemistry</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getMarkerColor(mockPathologyData.markers.her2.status, 0)}>
                      {mockPathologyData.markers.her2.status}
                    </Badge>
                    <p className="text-xs text-cacao/60 mt-1">{mockPathologyData.markers.her2.score}</p>
                  </div>
                </div>

                {/* Ki-67 */}
                <div className="flex items-center justify-between p-3 bg-almond/20 rounded-lg">
                  <div>
                    <span className="font-medium text-sm text-cacao">Ki-67</span>
                    <p className="text-xs text-cacao/60">Proliferation index</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-saffron/20 text-saffron">
                      {mockPathologyData.markers.ki67.percentage}%
                    </Badge>
                    <p className="text-xs text-cacao/60 mt-1">Moderate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Molecular Profile */}
      <Card className="bg-parchment border-almond">
        <CardHeader>
          <CardTitle className="text-base font-medium text-cacao">Molecular Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockPathologyData.molecularProfile.map((gene, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-almond/20 rounded-lg"
              >
                <div>
                  <span className="font-medium text-sm text-cacao">{gene.gene}</span>
                  <p className="text-xs text-cacao/60">{gene.status}</p>
                </div>
                <Badge className={getSignificanceColor(gene.significance)}>
                  {gene.significance}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-parchment border-almond">
        <CardHeader>
          <CardTitle className="text-base font-medium text-cacao flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Pathologist Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockPathologyData.recommendations.map((recommendation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2 p-3 bg-sage/10 rounded-lg"
              >
                <CheckCircle2 className="h-4 w-4 text-sage mt-0.5 flex-shrink-0" />
                <span className="text-sm text-cacao">{recommendation}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 