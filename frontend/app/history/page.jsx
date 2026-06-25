"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppCard, AppScaffold } from "../components/AppScaffold";
import { API_BASE_URL } from "../lib/api";

const history = [
  ["정통 사주", "오늘의 핵심 흐름", "방금 전"],
  ["오늘의 타로", "선택 전 확인한 카드", "어제"],
];

export default function HistoryPage() {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("saju-auth") || "null");
      if (!auth?.session?.accessToken) return;
      fetch(`${API_BASE_URL}/readings`, {
        headers: { Authorization: `Bearer ${auth.session.accessToken}` },
      })
        .then((response) => response.json())
        .then((data) => setReadings(data.readings || []))
        .catch(() => setReadings([]));
    } catch {
      setReadings([]);
    }
  }, []);

  return (
    <AppScaffold title="분석 기록" kicker="Saved">
      <div className="record-list">
        {readings.map((reading) => (
          <AppCard key={reading.id}>
            <div className="record-item">
              <div>
                <strong>{reading.type === "tarot" ? "타로" : "사주"}</strong>
                <h2>{reading.card?.koName || reading.topic}</h2>
                <p>{new Date(reading.createdAt).toLocaleString("ko-KR")}</p>
              </div>
              <Link href="/result">보기</Link>
            </div>
          </AppCard>
        ))}
        {history.map(([type, title, time]) => (
          <AppCard key={title}>
            <div className="record-item">
              <div>
                <strong>{type}</strong>
                <h2>{title}</h2>
                <p>{time}</p>
              </div>
              <Link href="/result">보기</Link>
            </div>
          </AppCard>
        ))}
      </div>
    </AppScaffold>
  );
}
