import { useMemo } from "react";

function getCheckinTime(checkin) {
  const date = checkin?.created_at || checkin?.createdAt;
  const time = date ? new Date(date).getTime() : Number.NaN;

  return Number.isNaN(time) ? null : time;
}

function sortCheckinsByDate(checkins, direction = "desc") {
  return [...checkins]
    .map((checkin, index) => ({
      checkin,
      index,
      time: getCheckinTime(checkin),
    }))
    .sort((a, b) => {
      if (a.time !== null && b.time !== null && a.time !== b.time) {
        return direction === "asc" ? a.time - b.time : b.time - a.time;
      }

      return direction === "asc" ? b.index - a.index : a.index - b.index;
    })
    .map(({ checkin }) => checkin);
}

export function useProgressStats({ logs, checkins }) {
  const sortedCheckinsDesc = useMemo(
    () => sortCheckinsByDate(checkins, "desc"),
    [checkins]
  );
  const sortedCheckinsAsc = useMemo(
    () => sortCheckinsByDate(checkins, "asc"),
    [checkins]
  );

  const stats = useMemo(() => {
    const latestCheckin = sortedCheckinsDesc[0] || null;
    const previousCheckin = sortedCheckinsDesc[1] || null;
    const firstCheckin = sortedCheckinsAsc[0] || null;
    const totalCheckins = sortedCheckinsDesc.length;

    if (latestCheckin) {
      const currentWeight = Number(latestCheckin.weight) || 0;
      const firstWeight = Number(firstCheckin?.weight) || 0;
      const previousWeight = Number(previousCheckin?.weight) || 0;
      const weeklyChange = previousWeight
        ? Number((currentWeight - previousWeight).toFixed(1))
        : 0;
      const change = firstWeight
        ? Number((currentWeight - firstWeight).toFixed(1))
        : 0;

      return {
        currentWeight,
        firstWeight,
        change,
        weeklyChange,
        direction: change < 0 ? "down" : change > 0 ? "up" : "neutral",
        totalLogs: totalCheckins,
        latestCheckin,
        previousCheckin,
        firstCheckin,
        totalCheckins,
      };
    }

    if (!logs.length) {
      return {
        currentWeight: 0,
        firstWeight: 0,
        change: 0,
        weeklyChange: 0,
        direction: "neutral",
        totalLogs: 0,
        latestCheckin: null,
        previousCheckin: null,
        firstCheckin: null,
        totalCheckins: 0,
      };
    }

    const newest = logs[0];
    const oldest = logs[logs.length - 1];

    const currentWeight = Number(newest.peso) || 0;
    const firstWeight = Number(oldest.peso) || 0;
    const change = Number((currentWeight - firstWeight).toFixed(1));

    return {
      currentWeight,
      firstWeight,
      change,
      weeklyChange: 0,
      direction: change < 0 ? "down" : change > 0 ? "up" : "neutral",
      totalLogs: logs.length,
      latestCheckin: null,
      previousCheckin: null,
      firstCheckin: null,
      totalCheckins: 0,
    };
  }, [logs, sortedCheckinsAsc, sortedCheckinsDesc]);

  return {
    sortedCheckinsDesc,
    sortedCheckinsAsc,
    stats,
  };
}
