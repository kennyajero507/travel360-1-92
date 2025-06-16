
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { Terminal, Play, AlertTriangle, Database } from 'lucide-react';

const SQLExecutor = () => {
  const [sqlQuery, setSqlQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const executeSQLQuery = async () => {
    if (!sqlQuery.trim()) {
      toast.error('Please enter a SQL query');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setColumns([]);
    
    const startTime = Date.now();

    try {
      // For now, we'll implement basic SELECT queries directly
      // In production, this would use the execute_sql RPC function
      if (sqlQuery.toLowerCase().trim().startsWith('select')) {
        // Simple implementation for basic queries
        if (sqlQuery.includes('FROM profiles')) {
          const { data, error } = await supabase.from('profiles').select('*').limit(100);
          if (error) throw error;
          setResults(data || []);
          if (data && data.length > 0) {
            setColumns(Object.keys(data[0]));
          }
        } else if (sqlQuery.includes('FROM organizations')) {
          const { data, error } = await supabase.from('organizations').select('*').limit(100);
          if (error) throw error;
          setResults(data || []);
          if (data && data.length > 0) {
            setColumns(Object.keys(data[0]));
          }
        } else {
          // For complex queries, show a message about RPC function
          throw new Error('Complex SQL queries require the execute_sql RPC function to be properly configured.');
        }
      } else {
        throw new Error('Only SELECT queries are currently supported in this demo version.');
      }

      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      toast.success(`Query executed successfully. ${results.length} rows returned.`);
    } catch (error: any) {
      console.error('SQL execution error:', error);
      setError(error.message || 'Failed to execute SQL query');
      toast.error('SQL execution failed');
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "SELECT COUNT(*) as total_users FROM profiles;",
    "SELECT role, COUNT(*) as count FROM profiles GROUP BY role;",
    "SELECT status, COUNT(*) as count FROM organizations GROUP BY status;",
    "SELECT * FROM system_events WHERE severity = 'critical' ORDER BY created_at DESC LIMIT 10;"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            SQL Query Executor (Demo Mode)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> Currently supports basic SELECT queries only. 
              Full SQL execution requires proper RPC function setup.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Textarea
                placeholder="Enter your SQL query here..."
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={8}
                className="font-mono"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button 
                onClick={executeSQLQuery}
                disabled={loading || !sqlQuery.trim()}
              >
                <Play className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Execute Query
              </Button>
              
              {executionTime && (
                <Badge variant="outline">
                  Execution time: {executionTime}ms
                </Badge>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Sample Queries:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sampleQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setSqlQuery(query)}
                    className="text-left justify-start font-mono text-xs"
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>SQL Error:</strong> {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Query Results ({results.length} rows)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column} className="min-w-32">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((row, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell key={column} className="font-mono text-xs">
                          {row[column] === null ? 'NULL' : String(row[column])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SQLExecutor;
