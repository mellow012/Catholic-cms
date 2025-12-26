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
import { Plus, Search, Download, FileText, Calendar, MapPin, User,BellRingIcon } from "lucide-react";
import Link from "next/link";

interface Marriage {
  id: string;
  groomFirstName: string;
  groomLastName: string;
  brideFirstName: string;
  brideLastName: string;
  marriageDate: string;
  location: string;
  officiantName: string;
  witness1Name: string;
  witness2Name: string;
  bannsPublished: boolean;
  premarriageCourseCompleted: boolean;
  parishId: string;
  approved: boolean;
  createdAt: string;
}

export default function MarriagesPage() {
  const { user, loading: rbacLoading, can } = useRBAC();
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchMarriages();
  }, [user]);

  const fetchMarriages = async () => {
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

      const response = await fetch(`/api/sacraments/marriage/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setMarriages(data.data);
      }
    } catch (error) {
      console.error("Error fetching marriages:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = marriages.filter((m) => {
    const couple = `${m.groomFirstName} ${m.groomLastName} ${m.brideFirstName} ${m.brideLastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return couple.includes(search) || m.location.toLowerCase().includes(search);
  });

  if (rbacLoading || loading) {
    return <PageLoading message="Loading marriage records..." />;
  }

  if (!user) {
    return <div className="p-10 text-center text-red-600">Please sign in.</div>;
  }

  const thisMonth = filtered.filter((m) => {
    const date = new Date(m.marriageDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BellRingIcon className="w-8 h-8 text-pink-600" />
            Marriage Records
          </h1>
          <p className="text-gray-600 mt-1">
            Sacred records of Holy Matrimony in your {user.clearanceLevel === "parish" ? "parish" : "diocese"}
          </p>
        </div>

        {can("CREATE_SACRAMENT") && (
          <Link href="/sacraments/marriage/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Marriage
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Marriages</p>
                <p className="text-2xl font-bold">{marriages.length}</p>
              </div>
              <FileText className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">{thisMonth}</p>
              </div>
              <Calendar className="w-8 h-8 text-rose-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Banns Published</p>
                <p className="text-2xl font-bold">
                  {marriages.filter((m) => m.bannsPublished).length}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Complete</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pre-Marriage Course</p>
                <p className="text-2xl font-bold">
                  {marriages.filter((m) => m.premarriageCourseCompleted).length}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
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
                placeholder="Search by groom, bride, or location..."
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
              icon={BellRingIcon}
              title="No marriage records found"
              description={searchTerm ? "Try different search terms" : "Start recording marriages"}
              action={
                can("CREATE_SACRAMENT")
                  ? { label: "Record Marriage", onClick: () => window.location.href = "/sacraments/marriage/new" }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Marriage Records ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.map((m) => (
                <Link
                  key={m.id}
                  href={`/sacraments/marriage/${m.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {m.groomFirstName} {m.groomLastName} & {m.brideFirstName} {m.brideLastName}
                        </h3>
                        <Badge variant={m.approved ? "success" : "warning"}>
                          {m.approved ? "Approved" : "Pending"}
                        </Badge>
                        {m.bannsPublished && <Badge variant="secondary">Banns Published</Badge>}
                        {m.premarriageCourseCompleted && <Badge variant="outline">Course Done</Badge>}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(m.marriageDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {m.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Officiant: {m.officiantName}
                        </span>
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