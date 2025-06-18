
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MapPin, Calendar, Users, Search, Filter } from 'lucide-react';
import CurrencyDisplay from '../quote/CurrencyDisplay';

interface TourTemplate {
  id: string;
  title: string;
  destination_name: string;
  country: string;
  region?: string;
  duration_days: number;
  duration_nights: number;
  tour_type: 'domestic' | 'international';
  description?: string;
  base_price?: number;
  currency_code: string;
  tags: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: any[];
  is_active: boolean;
}

interface TourTemplateSelectorProps {
  onSelectTemplate: (template: TourTemplate) => void;
  selectedTemplateId?: string;
  filterCountry?: string;
  filterTourType?: 'domestic' | 'international';
}

const TourTemplateSelector: React.FC<TourTemplateSelectorProps> = ({
  onSelectTemplate,
  selectedTemplateId,
  filterCountry,
  filterTourType
}) => {
  const [templates, setTemplates] = useState<TourTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState(filterCountry || '');
  const [typeFilter, setTypeFilter] = useState(filterTourType || '');
  const [tagFilter, setTagFilter] = useState('');

  // Mock data - in real app, this would come from Supabase
  useEffect(() => {
    const mockTemplates: TourTemplate[] = [
      {
        id: '1',
        title: '3-Day Maasai Mara Safari',
        destination_name: 'Maasai Mara',
        country: 'Kenya',
        region: 'Narok',
        duration_days: 3,
        duration_nights: 2,
        tour_type: 'domestic',
        description: 'Classic safari experience in the famous Maasai Mara National Reserve',
        base_price: 45000,
        currency_code: 'KES',
        tags: ['Safari', 'Wildlife', 'Big Five'],
        inclusions: ['Game drives', 'Accommodation', 'Meals', 'Transport'],
        exclusions: ['International flights', 'Visa fees', 'Personal expenses'],
        itinerary: [],
        is_active: true
      },
      {
        id: '2',
        title: '5-Day Serengeti Migration',
        destination_name: 'Serengeti',
        country: 'Tanzania',
        region: 'Mara',
        duration_days: 5,
        duration_nights: 4,
        tour_type: 'international',
        description: 'Witness the great wildebeest migration in Serengeti',
        base_price: 1200,
        currency_code: 'USD',
        tags: ['Safari', 'Migration', 'Wildlife'],
        inclusions: ['Game drives', 'Accommodation', 'Meals', 'Transport', 'Guide'],
        exclusions: ['International flights', 'Visa fees', 'Personal expenses'],
        itinerary: [],
        is_active: true
      },
      {
        id: '3',
        title: '2-Day Nairobi City Tour',
        destination_name: 'Nairobi',
        country: 'Kenya',
        region: 'Nairobi',
        duration_days: 2,
        duration_nights: 1,
        tour_type: 'domestic',
        description: 'Explore the vibrant capital city of Kenya',
        base_price: 15000,
        currency_code: 'KES',
        tags: ['City Tour', 'Culture', 'Museums'],
        inclusions: ['City tour', 'Accommodation', 'Meals', 'Transport'],
        exclusions: ['Personal expenses', 'Shopping'],
        itinerary: [],
        is_active: true
      }
    ];
    
    setTemplates(mockTemplates);
    setLoading(false);
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.destination_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !countryFilter || template.country === countryFilter;
    const matchesType = !typeFilter || template.tour_type === typeFilter;
    const matchesTag = !tagFilter || template.tags.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()));
    
    return matchesSearch && matchesCountry && matchesType && matchesTag && template.is_active;
  });

  const countries = Array.from(new Set(templates.map(t => t.country)));
  const allTags = Array.from(new Set(templates.flatMap(t => t.tags)));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Tour Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="domestic">Domestic</SelectItem>
              <SelectItem value="international">International</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates List */}
        <div className="space-y-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Filter className="h-8 w-8 mx-auto mb-2" />
              <p>No templates found matching your criteria</p>
            </div>
          ) : (
            filteredTemplates.map(template => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplateId === template.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onSelectTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{template.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{template.destination_name}, {template.country}</span>
                        {template.region && <span>({template.region})</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      {template.base_price && (
                        <p className="font-semibold text-lg">
                          <CurrencyDisplay amount={template.base_price} currencyCode={template.currency_code} />
                        </p>
                      )}
                      <Badge variant="outline" className="mt-1">
                        {template.tour_type === 'domestic' ? 'Domestic' : 'International'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{template.duration_days} days, {template.duration_nights} nights</span>
                    </div>
                  </div>

                  {template.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-medium text-green-600 mb-1">Included:</p>
                      <ul className="space-y-1">
                        {template.inclusions.slice(0, 3).map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                        {template.inclusions.length > 3 && (
                          <li className="text-gray-500">+ {template.inclusions.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-red-600 mb-1">Excluded:</p>
                      <ul className="space-y-1">
                        {template.exclusions.slice(0, 3).map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                        {template.exclusions.length > 3 && (
                          <li className="text-gray-500">+ {template.exclusions.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TourTemplateSelector;
