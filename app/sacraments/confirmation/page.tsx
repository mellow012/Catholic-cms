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
import { Plus, Search, Download, FileText, Calendar, MapPin, User, Cross } from "lucide-react";
import Link from "next/link";

interface Confirmation {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  confirmationName?: string;
  confirmationDate: string;
  location: string;
  bishopName: string;
  sponsorName?: string;
  parishId: string;
  approved: boolean;
  createdAt: string;
}

export default function ConfirmationsPage() {
  const { user, loading: rbacLoading, can } = useRBAC();
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchConfirmations();
  }, [user]);

  const fetchConfirmations = async () => {
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

      const response = await fetch(`/api/sacraments/confirmation/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setConfirmations(data.data);
      }
    } catch (error) {
      console.error("Error fetching confirmations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = confirmations.filter((c) => {
    const fullName = `${c.firstName} ${c.middleName || ""} ${c.lastName} ${c.confirmationName || ""}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || c.location.toLowerCase().includes(search) || c.bishopName.toLowerCase().includes(search);
  });

  if (rbacLoading || loading) {
    return <PageLoading message="Loading confirmation records..." />;
  }

  if (!user) {
    return <div className="p-10 text-center text-red-600">Please sign in.</div>;
  }

  const thisMonth = filtered.filter((c) => {
    const date = new Date(c.confirmationDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Cross className="w-8 h-8 text-amber-600" />
            Confirmation Records
          </h1>
          <p className="text-gray-600 mt-1">
            Manage confirmations in your {user.clearanceLevel === "parish" ? "parish" : "diocese"}
          </p>
        </div>

        {can("CREATE_SACRAMENT") && (
          <Link href="/sacraments/confirmation/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Confirmation
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
                <p className="text-sm text-gray-500">Total Confirmations</p>
                <p className="text-2xl font-bold">{confirmations.length}</p>
              </div>
              <FileText className="w-8 h-8 text-amber-500" />
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
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold">
                  {confirmations.filter((c) => !c.approved).length}
                </p>
              </div>
              <Badge className="bg-orange-100 text-orange-800">Warning</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Most Common Bishop</p>
                <p className="text-lg font-semibold">Most Rev. Montfort Stima</p>
              </div>
              <User className="w-8 h-8 text-purple-500" />
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
                placeholder="Search by name, confirmation name, bishop, or location..."
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
              icon={Cross}
              title="No confirmation records found"
              description={searchTerm ? "Try different search terms" : "Start recording confirmations"}
              action={
                can("CREATE_SACRAMENT")
                  ? { label: "Record Confirmation", onClick: () => window.location.href = "/sacraments/confirmation/new" }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Confirmation Records ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  href={`/sacraments/confirmation/${c.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {c.firstName} {c.middleName} {c.lastName}
                          {c.confirmationName && <span className="text-amber-700">("{c.confirmationName}")</span>}
                        </h3>
                        <Badge variant={c.approved ? "success" : "warning"}>
                          {c.approved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(c.confirmationDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {c.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Bishop: {c.bishopName}
                        </span>
                        {c.sponsorName && (
                          <span className="text-sm">
                            Sponsor: {c.sponsorName}
                          </span>
                        )}
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