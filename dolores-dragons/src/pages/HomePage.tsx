import { useState } from 'react';
import HeroSection from '../components/HeroSection';
import SponsorsSection from '../components/SponsorsSection';
import TeamsSection from '../components/TeamsSection';
import HistorySection from '../components/HistorySection';
import HallOfFameSection from '../components/HallOfFameSection';
import WeeklyQuintet from '../components/WeeklyQuintet';
import CalendarSection from '../components/CalendarSection';
import StandingsSection from '../components/StandingsSection';
import StatsSection from '../components/StatsSection';
import MediaSection from '../components/MediaSection';
import NewsSection from '../components/NewsSection';
import KitSection from '../components/KitSection';

interface HomePageProps {
  onOpenJoinForm: () => void;
}

export default function HomePage({ onOpenJoinForm }: HomePageProps) {
  return (
    <>
      <HeroSection onOpenJoinForm={onOpenJoinForm} />
      <NewsSection />
      <WeeklyQuintet />
      <CalendarSection />
      <StandingsSection />
      <StatsSection />
      <TeamsSection />
      <KitSection />
      <MediaSection />
      <HistorySection />
      <HallOfFameSection />
      <SponsorsSection />
    </>
  );
}
