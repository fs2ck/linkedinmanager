import React, { useState, useMemo } from 'react';
import { usePlannerStore } from '../../stores/usePlannerStore';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    ChevronLeft,
    ChevronRight,
    Clock
} from 'lucide-react';
import PostEditorModal from './PostEditorModal';
import Button from '../ui/Button';
import './PlannerCalendar.css';

const PlannerCalendar = ({ onOpenDelete }) => {
    const { currentPlan, posts, pillars } = usePlannerStore();
    const [currentDate, setCurrentDate] = useState(
        currentPlan?.start_date ? parseISO(currentPlan.start_date) : new Date()
    );
    const [selectedPost, setSelectedPost] = useState(null);

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const daysInMonth = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const getPillarColor = (pillarId) => {
        const pillar = pillars.find(p => p.id === pillarId);
        return pillar?.color || '#6366f1';
    };

    const getPillarName = (pillarId) => {
        const pillar = pillars.find(p => p.id === pillarId);
        return pillar?.name || '';
    };

    return (
        <div className="planner-calendar-container">
            {/* Calendar Header - Clean 3-Column Layout */}
            <div className="calendar-header-v3">
                {/* Left: Navigation */}
                <div className="calendar-nav-section">
                    <button
                        onClick={prevMonth}
                        className="calendar-nav-button"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="calendar-month-title">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                    <button
                        onClick={nextMonth}
                        className="calendar-nav-button"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Center: Today Button */}
                <div className="calendar-center-section">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={goToToday}
                        className="font-medium"
                    >
                        Hoje
                    </Button>
                </div>

                {/* Right: Empty for now, can add actions later */}
                <div className="calendar-right-section">
                    {/* Reserved for future actions */}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid-v3">
                {/* Weekday Headers */}
                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(day => (
                    <div key={day} className="weekday-header-v3">
                        {day}
                    </div>
                ))}

                {/* Day Cells */}
                {daysInMonth.map((day, idx) => {
                    const dayPosts = posts.filter(p => isSameDay(parseISO(p.date), day));
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isTodayDay = isToday(day);

                    return (
                        <div
                            key={idx}
                            className={`day-cell-v3 ${!isCurrentMonth ? 'outside-month' : ''} ${isTodayDay ? 'is-today' : ''}`}
                        >
                            <div className="day-number-wrapper-v3">
                                <span className="day-number-v3">{format(day, 'd')}</span>
                            </div>

                            <div className="cell-posts-container-v3">
                                {dayPosts.map(post => {
                                    const pillarColor = getPillarColor(post.pillar_id);
                                    return (
                                        <div
                                            key={post.id}
                                            className="post-card-v3"
                                            style={{
                                                borderLeftColor: pillarColor,
                                                backgroundColor: `${pillarColor}15`
                                            }}
                                            onClick={() => setSelectedPost(post)}
                                        >
                                            <div className="post-header-v3">
                                                <div className="post-time-v3" style={{ color: pillarColor }}>
                                                    <Clock size={10} strokeWidth={3} />
                                                    <span>{format(parseISO(post.date), 'HH:mm')}</span>
                                                </div>
                                            </div>
                                            <div className="post-title-v3">
                                                {post.title}
                                            </div>
                                            <div className="post-footer-v3">
                                                <span className="post-pillar-v3" style={{ color: pillarColor }}>
                                                    {getPillarName(post.pillar_id) || post.format}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <PostEditorModal
                post={selectedPost}
                onClose={() => setSelectedPost(null)}
            />
        </div>
    );
};

export default PlannerCalendar;
