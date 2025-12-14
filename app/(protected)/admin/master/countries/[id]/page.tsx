'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getCountryById, Country } from '@/lib/services/admin/countries';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

export default function ViewCountryPage() {
  const router = useRouter();
  const params = useParams();
  const countryId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<Country | null>(null);

  // Fetch country data
  useEffect(() => {
    const fetchCountry = async () => {
      if (!countryId) return;

      setLoading(true);
      try {
        const response = await getCountryById(countryId);

        handleApiResponse<Country>(response, {
          onSuccess: (countryData) => {
            setCountry(countryData);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load country');
            router.push('/admin/master/countries');
          },
          onUnauthorized: () => {
            toast.error('Unauthorized. Please check your authentication.');
            router.push('/admin/master/countries');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Fetch country error:', error);
        router.push('/admin/master/countries');
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, [countryId, router]);

  // Format date helper
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Country Details"
              description="View country information"
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="text-center py-8">Loading...</div>
        </Container>
      </Fragment>
    );
  }

  if (!country) {
    return null;
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Country Details"
            description="View country information"
          />
          <ToolbarActions>
            <Link href="/admin/master/countries">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href={`/admin/master/countries/${countryId}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Country
              </Button>
            </Link>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <Card className="min-w-full">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="kt-scrollable-x-auto pb-3 p-0">
            <Table className="align-middle text-sm text-muted-foreground">
              <TableBody>
                <TableRow>
                  <TableCell className="py-3 min-w-36 text-secondary-foreground font-normal">
                    Flag
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-4xl" title={country.countryName}>
                      {country.flag}
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Country Name
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {country.countryName || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Local Name
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {country.local || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    ISO 2 Code
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="secondary" className="font-mono" size="md">
                      {country.isoTwo || '-'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    ISO 3 Code
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="secondary" className="font-mono" size="md">
                      {country.isoThree || '-'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Phone Code
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    +{country.phoneCode || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Continent
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className="capitalize" size="md">
                      {country.continent || '-'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Status
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex gap-2">
                      <Badge
                        variant={country.status === 'active' ? 'success' : 'destructive'}
                        size="md"
                        appearance="light"
                      >
                        {country.status || '-'}
                      </Badge>
                      {country.isDeleted && (
                        <Badge variant="destructive" size="md" appearance="light">
                          Deleted
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Country ID
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {country.id || '-'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-full mt-5">
          <CardHeader>
            <CardTitle>Currency Information</CardTitle>
          </CardHeader>
          <CardContent className="kt-scrollable-x-auto pb-3 p-0">
            <Table className="align-middle text-sm text-muted-foreground">
              <TableBody>
                <TableRow>
                  <TableCell className="py-3 min-w-36 text-secondary-foreground font-normal">
                    Currency Name
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {country.currencyName || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Currency Code
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="secondary" className="font-mono" size="md">
                      {country.currencyCode || '-'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Currency Symbol
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm text-lg">
                    {country.currencySymbol || '-'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-full mt-5">
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="kt-scrollable-x-auto pb-3 p-0">
            <Table className="align-middle text-sm text-muted-foreground">
              <TableBody>
                <TableRow>
                  <TableCell className="py-3 min-w-36 text-secondary-foreground font-normal">
                    Created At
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {formatDate(country.createdAt)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Updated At
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {formatDate(country.updatedAt)}
                  </TableCell>
                </TableRow>
                {country.deletedAt && (
                  <TableRow>
                    <TableCell className="py-3 text-secondary-foreground font-normal">
                      Deleted At
                    </TableCell>
                    <TableCell className="py-3 text-foreground font-normal text-sm">
                      {formatDate(country.deletedAt)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Container>
    </Fragment>
  );
}
