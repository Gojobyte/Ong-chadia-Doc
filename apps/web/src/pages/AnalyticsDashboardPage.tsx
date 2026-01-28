import { useState, useRef, useCallback } from 'react';
import { BarChart3, Calendar, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  StorageWidget,
  ActivityChartWidget,
  TypeDistributionWidget,
  TopFoldersWidget,
  TopContributorsWidget,
  RecentUploadsWidget,
} from '@/components/analytics';
import { toast } from '@/hooks/useToast';
import type { Period } from '@/services/analytics.service';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
  { value: '12m', label: '12 mois' },
];

export default function AnalyticsDashboardPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = useCallback(async () => {
    if (!dashboardRef.current) return;

    setIsExporting(true);
    try {
      // Dynamic import for better code splitting
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      // Capture the dashboard as canvas
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // A4 landscape dimensions
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 10;

      // Add header
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59); // slate-800
      pdf.text('Tableau de bord Documents - ONG Chadia', margin, margin + 5);

      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139); // slate-500
      const periodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label || period;
      pdf.text(`Période: ${periodLabel}`, margin, margin + 12);
      pdf.text(`Généré le: ${new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, margin, margin + 18);

      // Calculate image dimensions to fit on page
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const maxImgHeight = pageHeight - margin - 25; // Leave space for header

      // Add the dashboard image
      if (imgHeight > maxImgHeight) {
        // Scale down if too tall
        const scaledWidth = (maxImgHeight * canvas.width) / canvas.height;
        pdf.addImage(imgData, 'PNG', margin + (imgWidth - scaledWidth) / 2, 28, scaledWidth, maxImgHeight);
      } else {
        pdf.addImage(imgData, 'PNG', margin, 28, imgWidth, imgHeight);
      }

      // Save the PDF
      pdf.save(`analytics-${period}-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'Export réussi',
        description: 'Le rapport PDF a été téléchargé',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Erreur d\'export',
        description: 'Impossible de générer le PDF',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [period]);

  return (
    <DashboardLayout>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Tableau de bord Documents
                </h1>
                <p className="text-sm text-gray-500">
                  Statistiques et analyse de l'utilisation de la GED
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Period Filter */}
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="text-sm border-0 bg-transparent focus:ring-0 pr-6 py-1 font-medium text-gray-700"
                >
                  {PERIOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white text-gray-700">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isExporting}
                className="btn-simple-outline"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Exporter PDF
              </Button>
            </div>
          </header>

          {/* Widgets Grid */}
          <div
            ref={dashboardRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 card-simple p-6"
          >
            {/* Row 1: Storage, Recent Uploads, Activity Chart */}
            <StorageWidget />
            <RecentUploadsWidget />
            <ActivityChartWidget period={period} />

            {/* Row 2: Type Distribution, Top Folders, Top Contributors */}
            <TypeDistributionWidget />
            <TopFoldersWidget />
            <TopContributorsWidget period={period} />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-400">
            Les données sont mises à jour automatiquement toutes les 5 minutes
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
