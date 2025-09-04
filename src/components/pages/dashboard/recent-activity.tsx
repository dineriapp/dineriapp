import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const RecentActivity = ({ activityData, activityLoading, name }: { activityData: { activity: { message: string, createdAt: string }[] } | undefined, activityLoading: boolean, name: string }) => {
    return (
        <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="pb-3 font-poppins">
                <CardTitle className="text-slate-900">Recent Activity</CardTitle>
                <CardDescription className="text-slate-500">Latest activities of your restaurent{" "}<span className="font-bold text-black">{name}</span></CardDescription>
            </CardHeader>
            <CardContent className="p-0 font-poppins">
                <div className="px-6 space-y-2">
                    {activityLoading && <p className="text-sm text-center text-gray-400">Loading...</p>}
                    {!activityLoading && activityData?.activity.length === 0 && (
                        <p className="text-xs text-center text-neutral-500">You don&apos;t have any yet.</p>
                    )}
                    {!activityLoading &&
                        activityData?.activity
                            .slice(0, 5) // show only the first 5
                            .map((item, i) => (
                                <div key={i} className="text-sm text-slate-700 border-b py-1 last:border-none">
                                    {item.message}
                                    <div className="text-xs text-slate-400">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                </div>

            </CardContent>
        </Card>
    )
}

export default RecentActivity
