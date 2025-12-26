// app/sacraments/search/page.tsx - Advanced sacrament search with fuzzy matching

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContexts';
import { getAuthToken } from '@/lib/authHelpers';
import { fuzzySearch } from '@/lib/fuzzySearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Calendar, MapPin, User, FileText, Info } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: string;
  firstName?: string;
  lastName?: string;
  groomName?: string;
  brideName?: string;
  date: string;
  location: string;
  parishId: string;
  approved: boolean;
}

export default function SearchPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    name: '',
    type: '',
    startDate: '',
    endDate: '',
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allResults, setAllResults] = useState<SearchResult[]>([]); // Store all results for fuzzy search
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [useFuzzy, setUseFuzzy] = useState(true);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const token = await getAuthToken();
      if (!token) return;

      const params = new URLSearchParams({
        dioceseId: user?.dioceseId || '',
        ...Object.fromEntries(
          Object.entries(searchParams).filter(([_, v]) => v !== '')
        ),
      });

      const response = await fetch(`/api/sacraments/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setAllResults(data.data);
        
        // Apply fuzzy search if name is provided
        if (useFuzzy && searchParams.name) {
          const fuzzyResults = fuzzySearch(
            data.data,
            searchParams.name,
            ['firstName', 'lastName', 'middleName', 'groomName', 'brideName', 'location'],
            0.4 // Lower threshold for more results
          );
          setResults(fuzzyResults);
        } else {
          setResults(data.data);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (result: SearchResult) => {
    if (result.type === 'marriage') {
      return `${result.groomName} & ${result.brideName}`;
    }
    return `${result.firstName || ''} ${result.lastName || ''}`.trim();
  };

  const getSacramentIcon = (type: string) => {
    const icons: Record<string, string> = {
      baptism: '💧',
      confirmation: '🕊️',
      eucharist: '🍞',
      marriage: '💍',
      holy_orders: '✝️',
      anointing: '🙏',
    };
    return icons[type] || '📄';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Search Sacrament Records</h1>
        <p className="text-gray-600 mt-1">
          Find sacrament records using fuzzy search - works even with typos!
        </p>
      </div>

      {/* Fuzzy Search Info */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium mb-1">Fuzzy Search Enabled</p>
              <p className="text-sm text-blue-700">
                Our intelligent search can find matches even with spelling mistakes. Try searching for "Chikonde" 
                and it will find "Chikondi" too!
              </p>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={useFuzzy}
                  onChange={(e) => setUseFuzzy(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-blue-800">Use fuzzy matching</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Search by name..."
                  value={searchParams.name}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="type">Sacrament Type</Label>
                <select
                  id="type"
                  value={searchParams.type}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, type: e.target.value })
                  }
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="baptism">Baptism</option>
                  <option value="confirmation">Confirmation</option>
                  <option value="eucharist">First Communion</option>
                  <option value="marriage">Marriage</option>
                  <option value="holy_orders">Holy Orders</option>
                  <option value="anointing">Anointing</option>
                </select>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={searchParams.startDate}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={searchParams.endDate}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={loading} className="flex-1 md:flex-none">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Records
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchParams({ name: '', type: '', startDate: '', endDate: '' });
                  setResults([]);
                  setSearched(false);
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && (
        <Card>
          <CardHeader>
            <CardTitle>
              Search Results ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No records found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/sacraments/${result.type}/${result.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-3xl">{getSacramentIcon(result.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {getDisplayName(result)}
                            </h3>
                            <Badge variant="default" className="capitalize">
                              {result.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant={result.approved ? 'success' : 'warning'}>
                              {result.approved ? 'Approved' : 'Pending'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(result.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {result.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}