import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Calendar from 'react-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, TrendingUp, Wallet } from 'lucide-react';
import { getCurrentLanguage, getTranslation } from '@/lib/i18n';
import { formatCurrencyByLanguage } from '@/lib/i18n';
import type { DividendEvent } from '@shared/schema';
import 'react-calendar/dist/Calendar.css';

export default function DividendCalendar() {
  const language = getCurrentLanguage();
  const t = getTranslation(language);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  // SEO Meta Tags
  useEffect(() => {
    const title = language === 'en' 
      ? 'Dividend Calendar - Track US Stock Ex-Dividend Dates'
      : '배당 달력 - 미국 주식 배당락일 추적';
    
    const description = language === 'en'
      ? 'Track ex-dividend dates and payment dates for US stocks. View monthly dividend calendar with company symbols, dividend amounts, and payment schedules.'
      : '미국 주식의 배당락일과 지급일을 추적하세요. 월별 배당 달력으로 종목명, 배당금액, 지급 일정을 확인할 수 있습니다.';

    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    }
  }, [language]);

  // Fetch dividend calendar data
  const { data: dividendEvents = [], isLoading, error } = useQuery({
    queryKey: ['/api/dividend-calendar', selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split('-');
      const from = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const to = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;
      
      const response = await fetch(`/api/dividend-calendar?from=${from}&to=${to}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dividend calendar data');
      }
      return response.json();
    },
    enabled: !!selectedMonth,
  });

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dividendEvents.filter((event: DividendEvent) => 
      event.date === dateStr || event.paymentDate === dateStr
    );
  };

  // Check if date has events
  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  // Handle month change
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  // Generate month options
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Previous 2 months, current month, next 3 months
    for (let i = -2; i <= 3; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = language === 'en' 
        ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
      
      options.push({ value, label });
    }
    
    return options;
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyByLanguage(amount, language, 'USD');
  };

  const eventsForSelectedDate = getEventsForDate(selectedDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {language === 'en' ? 'Dividend Calendar' : '배당 달력'}
        </h1>
        <p className="text-gray-600">
          {language === 'en' 
            ? 'Track ex-dividend dates and payment dates for US stocks'
            : '미국 주식의 배당락일과 지급일을 추적하세요'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  {language === 'en' ? 'Monthly Calendar' : '월별 달력'}
                </CardTitle>
                <Select value={selectedMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getMonthOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">
                    {language === 'en' ? 'Loading calendar...' : '달력 로딩 중...'}
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-red-500">
                    {language === 'en' 
                      ? 'Failed to load dividend data. Please check your API key.'
                      : '배당 데이터를 불러오지 못했습니다. API 키를 확인해주세요.'
                    }
                  </div>
                </div>
              ) : (
                <div className="react-calendar-wrapper">
                  <Calendar
                    onChange={(date) => {
                      if (date instanceof Date) {
                        setSelectedDate(date);
                      }
                    }}
                    value={selectedDate}
                    tileClassName={({ date }) => {
                      return hasEvents(date) ? 'has-events' : '';
                    }}
                    tileContent={({ date }) => {
                      const events = getEventsForDate(date);
                      if (events.length > 0) {
                        return (
                          <div className="event-indicators">
                            <div className="event-dot"></div>
                            <div className="event-count">{events.length}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Details Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                {language === 'en' ? 'Events' : '이벤트'}
                <Badge variant="secondary">
                  {selectedDate.toLocaleDateString(language === 'en' ? 'en-US' : 'ko-KR')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>
                    {language === 'en' 
                      ? 'No dividend events on this date'
                      : '이 날짜에는 배당 이벤트가 없습니다'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventsForSelectedDate.map((event, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="font-mono">
                          {event.symbol}
                        </Badge>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(event.dividend)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>{language === 'en' ? 'Ex-Date:' : '배당락일:'}</span>
                          <span>{new Date(event.date).toLocaleDateString(language === 'en' ? 'en-US' : 'ko-KR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{language === 'en' ? 'Pay Date:' : '지급일:'}</span>
                          <span>{new Date(event.paymentDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ko-KR')}</span>
                        </div>
                        {event.recordDate && (
                          <div className="flex justify-between">
                            <span>{language === 'en' ? 'Record Date:' : '기준일:'}</span>
                            <span>{new Date(event.recordDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ko-KR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'en' ? 'Monthly Summary' : '월별 요약'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{language === 'en' ? 'Total Events:' : '총 이벤트:'}</span>
                  <span className="font-semibold">{dividendEvents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'en' ? 'Unique Stocks:' : '고유 종목 수:'}</span>
                  <span className="font-semibold">
                    {new Set(dividendEvents.map((e: DividendEvent) => e.symbol)).size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'en' ? 'Avg Dividend:' : '평균 배당금:'}</span>
                  <span className="font-semibold">
                    {dividendEvents.length > 0 
                      ? formatCurrency(
                          dividendEvents.reduce((sum: number, e: DividendEvent) => sum + e.dividend, 0) / dividendEvents.length
                        )
                      : '$0.00'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}