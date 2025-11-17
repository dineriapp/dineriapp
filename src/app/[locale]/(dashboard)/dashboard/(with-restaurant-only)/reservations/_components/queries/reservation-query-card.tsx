import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueryStatusColor, getStatusLabel } from "@/lib/utils";
import { ReservationQuery } from "@prisma/client";
import { format } from "date-fns";
import { Trash2 } from 'lucide-react';

interface AdminReservationQueryCardProps {
    query: ReservationQuery;
    onDelete: (id: string) => void;
}

export function ReservationQueryCard({ query, onDelete }: AdminReservationQueryCardProps) {

    const statusColor = getQueryStatusColor(query.status);
    const statusLabel = getStatusLabel(query.status);

    return (
        <>
            <Card className="overflow-hidden gap-0">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle className="text-base">{query.name}</CardTitle>
                            <CardDescription>{query.email}</CardDescription>
                        </div>
                        <Badge className={statusColor}>{statusLabel}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Date & Time</p>
                            <p className="font-medium">
                                {format(new Date(query.date), "MMM dd, yyyy")} at {query.time}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="font-medium">{query.phoneNumber || "Not provided"}</p>
                        </div>
                    </div>

                    <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">{query.message}</p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full bg-red-500 cursor-pointer"
                            onClick={() => onDelete(query.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

        </>
    );
}
