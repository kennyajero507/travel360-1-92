
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { DatePicker } from '../ui/date-picker';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Download, FileText, FileSpreadsheet, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  reportType: string;
  dateRange: { start?: Date; end?: Date };
  includeCharts: boolean;
  includeRawData: boolean;
  selectedMetrics: string[];
}

const ReportsExportManager = () => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    reportType: 'overview',
    dateRange: {},
    includeCharts: true,
    includeRawData: false,
    selectedMetrics: ['revenue', 'bookings', 'quotes']
  });

  const [isExporting, setIsExporting] = useState(false);

  const availableMetrics = [
    { id: 'revenue', label: 'Revenue Analytics' },
    { id: 'bookings', label: 'Booking Statistics' },
    { id: 'quotes', label: 'Quote Performance' },
    { id: 'inquiries', label: 'Inquiry Trends' },
    { id: 'destinations', label: 'Destination Analytics' },
    { id: 'clients', label: 'Client Insights' }
  ];

  const handleMetricToggle = (metricId: string) => {
    setExportOptions(prev => ({
      ...prev,
      selectedMetrics: prev.selectedMetrics.includes(metricId)
        ? prev.selectedMetrics.filter(id => id !== metricId)
        : [...prev.selectedMetrics, metricId]
    }));
  };

  const handleExport = async () => {
    if (exportOptions.selectedMetrics.length === 0) {
      toast.error('Please select at least one metric to export');
      return;
    }

    setIsExporting(true);
    toast.info(`Generating ${exportOptions.format.toUpperCase()} report...`);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // TODO: Implement actual export logic
      const filename = `analytics-report-${exportOptions.reportType}-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
      
      toast.success(`Report exported successfully: ${filename}`);
    } catch (error) {
      toast.error('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'excel': return <FileSpreadsheet className="h-4 w-4" />;
      case 'csv': return <FileSpreadsheet className="h-4 w-4" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Export Reports</h2>
        <p className="text-gray-600">Generate and download comprehensive analytics reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Export Configuration</CardTitle>
            <CardDescription>Configure your report settings and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select 
                value={exportOptions.format} 
                onValueChange={(value: 'pdf' | 'csv' | 'excel') => 
                  setExportOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF Report
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel Spreadsheet
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV Data
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select 
                value={exportOptions.reportType} 
                onValueChange={(value) => 
                  setExportOptions(prev => ({ ...prev, reportType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Business Overview</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="operational">Operational Metrics</SelectItem>
                  <SelectItem value="performance">Performance Analysis</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex items-center gap-2">
                <DatePicker
                  date={exportOptions.dateRange.start}
                  onSelect={(date) => 
                    setExportOptions(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, start: date } 
                    }))
                  }
                  placeholder="Start Date"
                />
                <span className="text-gray-400">to</span>
                <DatePicker
                  date={exportOptions.dateRange.end}
                  onSelect={(date) => 
                    setExportOptions(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, end: date } 
                    }))
                  }
                  placeholder="End Date"
                />
              </div>
            </div>

            <Separator />

            {/* Export Options */}
            <div className="space-y-4">
              <Label>Export Options</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={exportOptions.includeCharts}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeCharts: !!checked }))
                  }
                />
                <Label htmlFor="includeCharts">Include Charts and Visualizations</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeRawData"
                  checked={exportOptions.includeRawData}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeRawData: !!checked }))
                  }
                />
                <Label htmlFor="includeRawData">Include Raw Data Tables</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Metrics</CardTitle>
            <CardDescription>Choose which metrics to include in your report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={exportOptions.selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => handleMetricToggle(metric.id)}
                  />
                  <Label htmlFor={metric.id} className="font-normal">
                    {metric.label}
                  </Label>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Export Summary */}
            <div className="space-y-4">
              <h4 className="font-medium">Export Summary</h4>
              <div className="text-sm space-y-2 text-gray-600">
                <p>Format: {exportOptions.format.toUpperCase()}</p>
                <p>Report Type: {exportOptions.reportType}</p>
                <p>Metrics: {exportOptions.selectedMetrics.length} selected</p>
                <p>
                  Date Range: {
                    exportOptions.dateRange.start && exportOptions.dateRange.end
                      ? `${exportOptions.dateRange.start.toLocaleDateString()} - ${exportOptions.dateRange.end.toLocaleDateString()}`
                      : 'All time'
                  }
                </p>
              </div>
            </div>

            {/* Export Button */}
            <Button 
              onClick={handleExport} 
              disabled={isExporting || exportOptions.selectedMetrics.length === 0}
              className="w-full mt-6"
              size="lg"
            >
              {getFormatIcon(exportOptions.format)}
              {isExporting ? (
                <>Generating Report...</>
              ) : (
                <>Export {exportOptions.format.toUpperCase()} Report</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Templates</CardTitle>
          <CardDescription>Pre-configured report templates for common use cases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                setExportOptions({
                  format: 'pdf',
                  reportType: 'financial',
                  dateRange: {},
                  includeCharts: true,
                  includeRawData: false,
                  selectedMetrics: ['revenue', 'bookings']
                });
                handleExport();
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Monthly Financial</span>
              </div>
              <span className="text-sm text-gray-500 text-left">
                Revenue and booking performance for the current month
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                setExportOptions({
                  format: 'excel',
                  reportType: 'operational',
                  dateRange: {},
                  includeCharts: false,
                  includeRawData: true,
                  selectedMetrics: ['bookings', 'quotes', 'inquiries']
                });
                handleExport();
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="font-medium">Operations Data</span>
              </div>
              <span className="text-sm text-gray-500 text-left">
                Detailed operational metrics with raw data export
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                setExportOptions({
                  format: 'pdf',
                  reportType: 'overview',
                  dateRange: {},
                  includeCharts: true,
                  includeRawData: false,
                  selectedMetrics: availableMetrics.map(m => m.id)
                });
                handleExport();
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Executive Summary</span>
              </div>
              <span className="text-sm text-gray-500 text-left">
                Comprehensive overview with all key metrics and charts
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsExportManager;
