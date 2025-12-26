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
import { Plus, Search, Download, FileText, Calendar, MapPin, Church } from "lucide-react";
import Link from "next/link";

interface HolyOrder {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  orderType: "deacon" | "priest" | "bishop";
  ordinationDate: string;
  location: string;
  ordainingBishop: string;
  incardinationDiocese?: string;
  approved: boolean;
  createdAt: string;
}

export default function HolyOrdersPage() {
  const { user, loading: rbacLoading, can } = useRBAC();
  const [orders, setOrders] = useState<HolyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchHolyOrders();
  }, [user]);

  const fetchHolyOrders = async () => {
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

      const response = await fetch(`/api/sacraments/holy-orders/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Error fetching holy orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter((o) => {
    const fullName = `${o.firstName} ${o.middleName || ""} ${o.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || o.location.toLowerCase().includes(search) || o.ordainingBishop.toLowerCase().includes(search);
  });

  if (rbacLoading || loading) {
    return <PageLoading message="Loading holy orders records..." />;
  }

  if (!user) {
    return <div className="p-10 text-center text-red-600">Please sign in.</div>;
  }

  const priests = filtered.filter((o) => o.orderType === "priest").length;
  const deacons = filtered.filter((o) => o.orderType === "deacon").length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Church className="w-8 h-8 text-purple-600" />
            Holy Orders Records
          </h1>
          <p className="text-gray-600 mt-1">
            Sacred records of ordination to the diaconate and priesthood
          </p>
        </div>

        {can("CREATE_SACRAMENT") && (
          <Link href="/sacraments/holy-orders/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Ordination
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
                <p className="text-sm text-gray-500">Total Ordinations</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Priests</p>
                <p className="text-2xl font-bold">{priests}</p>
              </div>
              <Church className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Deacons</p>
                <p className="text-2xl font-bold">{deacons}</p>
              </div>
              <Church className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => !o.approved).length}
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
                placeholder="Search by name, bishop, or location..."
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
              icon={Church}
              title="No holy orders records found"
              description="Start recording ordinations to the sacred ministry"
              action={
                can("CREATE_SACRAMENT")
                  ? { label: "Record Ordination", onClick: () => window.location.href = "/sacraments/holy-orders/new" }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Holy Orders Records ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.map((o) => (
                <Link
                  key={o.id}
                  href={`/sacraments/holy-orders/${o.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Rev. {o.firstName} {o.middleName} {o.lastName}
                        </h3>
                        <Badge variant="secondary" className="capitalize">
                          {o.orderType}
                        </Badge>
                        <Badge variant={o.approved ? "success" : "warning"}>
                          {o.approved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(o.ordinationDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {o.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Church className="w-4 h-4" />
                          Ordained by: {o.ordainingBishop}
                        </span>
                        {o.incardinationDiocese && (
                          <span>Incardinated: {o.incardinationDiocese}</span>
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