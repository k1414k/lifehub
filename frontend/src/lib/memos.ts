import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
  isBefore,
  parseISO,
} from "date-fns";
import { ja } from "date-fns/locale";
import type { Memo } from "@/types";

export function isDeadlineMemo(memo: Memo) {
  return memo.memo_type === "deadline" && Boolean(memo.deadline_at);
}

export function formatDeadlineDateTime(dateString: string) {
  return format(parseISO(dateString), "yyyy/MM/dd HH:mm", { locale: ja });
}

export function getDeadlineStatus(deadlineAt: string, now: Date) {
  const deadline = parseISO(deadlineAt);

  if (deadline.getTime() <= now.getTime() || isBefore(deadline, now)) {
    return { expired: true, label: "期限切れ" };
  }

  const totalMinutes = differenceInMinutes(deadline, now);
  const days = differenceInDays(deadline, now);
  const hours = differenceInHours(deadline, now) % 24;
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return { expired: false, label: `残り${days}日${hours}時間` };
  }

  if (differenceInHours(deadline, now) > 0) {
    return { expired: false, label: `残り${differenceInHours(deadline, now)}時間${minutes}分` };
  }

  return { expired: false, label: `残り${Math.max(totalMinutes, 0)}分` };
}

export function sortDeadlineMemos(memos: Memo[]) {
  return [...memos].sort((a, b) => {
    const aTime = a.deadline_at ? parseISO(a.deadline_at).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.deadline_at ? parseISO(b.deadline_at).getTime() : Number.POSITIVE_INFINITY;

    if (aTime !== bTime) return aTime - bTime;

    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}
