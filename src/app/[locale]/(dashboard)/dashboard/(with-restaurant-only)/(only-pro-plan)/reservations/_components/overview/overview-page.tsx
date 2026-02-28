import LoadingUI from "@/components/loading-ui";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import StatusBreakdown from "./status-breakdown";
import MainStats from "./main-stats";
import DayCapacity from "./day-capacity";
import { useTranslations } from "next-intl";

const OverviewPage = () => {
  const [date, setDate] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const { selectedRestaurant: restaurant } = useRestaurantStore();
  const t = useTranslations("overviewPage");
  const restaurant_id = restaurant?.id;

  const formatted_date = format(date, "yyyy-MM-dd");

  if (!restaurant) {
    return <LoadingUI text={t("loading")} />;
  }

  return (
    <div className="space-y-4 relative">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t("title")}</h2>
          <p className="text-slate-600 mt-1">{t("subtitle")}</p>
        </div>

        {/* Date Picker */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="md:w-fit w-full max-md:h-12 justify-start cursor-pointer text-left font-normal gap-2"
            >
              {formatted_date}
              <CalendarDays className="h-4 w-4 opacity-70" />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="p-0 w-fit">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(value) => {
                if (value) {
                  setDate(value);
                  setOpen(false); // 🔥 CLOSE POPOVER ON SELECTION
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* content  */}
      <div className="grid md:grid-cols-12 gap-4">
        <div className="md:col-span-12">
          <MainStats
            restaurant_id={restaurant_id}
            formatted_date={formatted_date}
          />
        </div>
        <div className="md:col-span-6">
          <DayCapacity
            restaurant_id={restaurant_id}
            formatted_date={formatted_date}
          />
        </div>
        <div className="md:col-span-6">
          <StatusBreakdown
            restaurant_id={restaurant_id}
            formatted_date={formatted_date}
          />
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
