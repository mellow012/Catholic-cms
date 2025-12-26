"use client";

import { useEffect, useState } from "react";
import { useRBAC } from "@/lib/hooks/useRBAC";
import { getAuthToken } from "@/lib/authHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "../../components/Loading";
import { EmptyState } from "../../components/EmptyState";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Download, FileText, Calendar, MapPin, Heart } from "lucide-react";
import Link from "next/link";

interface Anointing {
  id: string;
  firstName: string;
  lastName: string;
  anointingDate: string;
  location: string;
  priestName: string;
  reason?: string;
  approved: boolean;
  createdAt: string;
}

export default function AnointingsPage() {
  const { user, loading: rbacLoading, can } = useRBAC();
  const [anointings, setAnointings] = useState<Anointing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchAnointings();
  }, [user]);

  const fetchAnointings = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const params = new URLSearchParams({
        dioceseId: user?.dioceseId || "mangochi",
        limit: "50",
      });

      if (user?.clearanceLevel === "parish" && user?.parishId) {
        params.append("parishId", user.parishId);
      }

      const response = await fetch(`/api/sacraments/anointing/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setAnointings(data.data);
      }
    } catch (error) {
      console.error("Error fetching anointings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = anointings.filter((a) => {
    const fullName = `${a.firstName} ${a.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || a.location.toLowerCase().includes(search) || a.reason?.toLowerCase().includes(search) || false;
  });

  if (rbacLoading || loading) {
    return <PageLoading message="Loading anointing records..." />;
  }

  if (!user) {
    return <div className="p-10 text-center text-red-600">Please sign in.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-600" />
            Anointing of the Sick Records
          </h1>
          <p className="text-gray-600 mt-1">
            Records of the sacrament of healing and strength
          </p>
        </div>

        {can("CREATE_SACRAMENT") && (
          <Link href="/sacraments/anointing/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Anointing
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Anointings</p>
                <p className="text-2xl font-bold">{anointings.length}</p>
              </div>
              <FileText className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">
                  {anointings.filter((a) => {
                    const date = new Date(a.anointingDate);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold">
                  {anointings.filter((a) => !a.approved).length}
                </p>
              </div>
              <Badge className="bg-orange-100 text-orange-800">Review</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, location, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={Heart}
              title="No anointing records found"
              description="Start recording this sacrament of healing"
              action={
                can("CREATE_SACRAMENT")
                  ? { label: "Record Anointing", onClick: () => window.location.href = "/sacraments/anointing/new" }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Anointing Records ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.map((a) => (
                <Link
                  key={a.id}
                  href={`/sacraments/anointing/${a.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {a.firstName} {a.lastName}
                        </h3>
                        <Badge variant={a.approved ? "success" : "warning"}>
                          {a.approved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(a.anointingDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {a.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          Administered by: {a.priestName}
                        </span>
                        {a.reason && <span>Reason: {a.reason}</span>}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}