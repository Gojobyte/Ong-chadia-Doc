import { useState, useRef, useCallback } from 'react';
import { BarChart3, Calendar, Download, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f] relative">
        {/* Background glow effects */}
        <div className="fixed top-20 right-40 w-80 h-80 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="fixed bottom-20 left-20 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-500/25">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">
                    Tableau de bord Documents
                  </h1>
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-sm text-slate-400">
                  Statistiques et analyse de l'utilisation de la GED
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Period Filter */}
              <div className="flex items-center gap-2 glass rounded-xl border border-white/[0.06] p-1.5">
                <Calendar className="w-4 h-4 text-slate-400 ml-2" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="text-sm border-0 bg-transparent focus:ring-0 pr-8 py-1.5 font-medium text-slate-300"
                >
                  {PERIOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#12121a] text-slate-300">
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
                className="btn-ghost-dark"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Exporter PDF
              </Button>
            </div>
          </motion.header>

          {/* Widgets Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            ref={dashboardRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 glass-strong p-6 rounded-2xl border border-white/[0.06]"
          >
            {/* Row 1: Storage, Recent Uploads, Activity Chart */}
            <StorageWidget />
            <RecentUploadsWidget />
            <ActivityChartWidget period={period} />

            {/* Row 2: Type Distribution, Top Folders, Top Contributors */}
            <TypeDistributionWidget />
            <TopFoldersWidget />
            <TopContributorsWidget period={period} />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center text-xs text-slate-500"
          >
            Les données sont mises à jour automatiquement toutes les 5 minutes
          </motion.div>
        </div>
      </main>
    </DashboardLayout>
  );
}
