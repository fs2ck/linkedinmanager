import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Users, Eye, Percent, Upload, ExternalLink, Target, Edit2, Check, X } from 'lucide-react';
import { startOfMonth, subMonths, startOfWeek, endOfWeek, isWithinInterval, format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardLayout from '../components/layout/DashboardLayout';
import MetricsCard from '../components/features/MetricsCard';
import { BarChartComponent, PieChartComponent } from '../components/charts/PerformanceChart';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ImportModal from '../components/features/ImportModal';
import { importService } from '../services/storage/importService';
import { supabase, storageService } from '../services/storage/supabaseService';
import { toast } from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [chartFilter, setChartFilter] = useState('monthly'); // 'daily', 'weekly', 'monthly', 'quarterly'
    const [allData, setAllData] = useState([]);
    const [manualGoal, setManualGoal] = useState(0);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [tempGoal, setTempGoal] = useState(0);

    const [metrics, setMetrics] = useState({
        totalEngagement: 0,
        engagementChange: 0,
        totalImpressions: 0,
        impressionsChange: 0,
        avgReach: 0,
        reachChange: 0,
        totalPosts: 0,
        postsChange: 0,
        totalFollowers: 0,
        followersChange: 0,
    });

    const [demographics, setDemographics] = useState({});

    const formatNumber = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '0';
        return Number(num).toLocaleString('pt-BR');
    };

    const calculateChange = (current, previous) => {
        if (!previous || previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    const [recentPosts, setRecentPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsFilter, setPostsFilter] = useState('30d'); // '30d', '90d', 'all'
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Reset pagination when filter or itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [postsFilter, itemsPerPage]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || '00000000-0000-0000-0000-000000000000';

            // 1. Fetch Goals
            const goalData = await storageService.getWeeklyGoal(userId);
            if (goalData) {
                setManualGoal(goalData.target_engagement);
                setTempGoal(goalData.target_engagement);
            }

            // 2. Fetch Metrics (Parallel)
            const [metricsRes, demoRes, followersRes] = await Promise.all([
                supabase
                    .from('metrics_history')
                    .select('*')
                    .eq('user_id', userId)
                    .order('published_at', { ascending: true }),
                supabase
                    .from('demographics_history')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('followers_history')
                    .select('*')
                    .eq('user_id', userId)
                    .order('recorded_at', { ascending: false })
            ]);

            if (metricsRes.error) throw metricsRes.error;
            const data = metricsRes.data || [];
            setAllData(data);

            // Process Demographics (Group by category, keep latest import)
            if (demoRes.data?.length > 0) {
                const latestImportId = demoRes.data[0].source_file_id;
                const latestDemo = demoRes.data.filter(d => d.source_file_id === latestImportId);
                const grouped = latestDemo.reduce((acc, curr) => {
                    if (!acc[curr.category]) acc[curr.category] = [];
                    acc[curr.category].push({ name: curr.label, value: curr.value_percent });
                    return acc;
                }, {});
                setDemographics(grouped);
            }

            // Process Followers
            const latestFollowers = followersRes.data?.[0]?.follower_count || 0;
            const prevFollowers = followersRes.data?.[1]?.follower_count || 0;

            if (data && data.length > 0) {
                // Calculate Stats Card (Current Month vs Previous Month)
                const now = new Date();
                const currentMonthStart = startOfMonth(now);
                const prevMonthStart = startOfMonth(subMonths(now, 1));
                const prevMonthEnd = subDays(currentMonthStart, 1);

                const currentMonthData = data.filter(m => new Date(m.published_at) >= currentMonthStart);
                const prevMonthData = data.filter(m => {
                    const d = new Date(m.published_at);
                    return d >= prevMonthStart && d <= prevMonthEnd;
                });


                // Total Engagement
                // Total Engagement
                const currEng = currentMonthData.reduce((acc, curr) => acc + curr.reactions + curr.comments + curr.shares, 0);
                const prevEng = prevMonthData.reduce((acc, curr) => acc + curr.reactions + curr.comments + curr.shares, 0);

                // Total Impressions
                const currImpr = currentMonthData.reduce((acc, curr) => acc + curr.impressions, 0);
                const prevImpr = prevMonthData.reduce((acc, curr) => acc + curr.impressions, 0);

                // Avg Reach
                const currReach = currentMonthData.length > 0
                    ? currentMonthData.reduce((acc, curr) => acc + curr.impressions, 0) / currentMonthData.length
                    : 0;
                const prevReach = prevMonthData.length > 0
                    ? prevMonthData.reduce((acc, curr) => acc + curr.impressions, 0) / prevMonthData.length
                    : 0;

                setMetrics({
                    totalEngagement: currEng || data.reduce((acc, curr) => acc + curr.reactions + curr.comments + curr.shares, 0) || 0,
                    engagementChange: calculateChange(currEng, prevEng),
                    totalImpressions: currImpr || data.reduce((acc, curr) => acc + curr.impressions, 0) || 0,
                    impressionsChange: calculateChange(currImpr, prevImpr),
                    avgReach: Math.round(currReach || (data.length > 0 ? (data.reduce((acc, curr) => acc + curr.impressions, 0) / data.length) : 0)),
                    reachChange: calculateChange(currReach, prevReach),
                    totalPosts: currentMonthData.length || data.length,
                    postsChange: calculateChange(currentMonthData.length, prevMonthData.length),
                    totalFollowers: latestFollowers || 0,
                    followersChange: calculateChange(latestFollowers, prevFollowers),
                });

                // Map all data, reversed
                setRecentPosts([...data].reverse().map(m => ({
                    id: m.id,
                    title: m.post_id || 'Link indisponível',
                    date: m.published_at,
                    status: 'published',
                    engagement: m.reactions + m.comments + m.shares,
                    reach: m.impressions,
                    url: m.post_id
                })));
            } else {
                // Keep defaults but update followers
                setMetrics(prev => ({
                    ...prev,
                    totalFollowers: latestFollowers || 0,
                    followersChange: calculateChange(latestFollowers, prevFollowers),
                }));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Erro ao carregar dados do dashboard.');
        } finally {
            setIsLoading(false);
        }
    };

    // Filtered Posts Logic
    const filteredPosts = useMemo(() => {
        if (postsFilter === 'all') return recentPosts;

        const now = new Date();
        const days = postsFilter === '30d' ? 30 : 90;
        const cutOff = subDays(now, days);

        return recentPosts.filter(p => new Date(p.date) >= cutOff);
    }, [recentPosts, postsFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const paginatedPosts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredPosts.slice(start, start + itemsPerPage);
    }, [filteredPosts, currentPage]);

    // Chart Data Aggregation Logic
    const impressionsChartData = useMemo(() => {
        if (!allData.length) return [];

        const now = new Date();
        let cutOff;

        // Determine how far back we should look based on the filter
        if (chartFilter === 'daily') {
            cutOff = subDays(now, 14);
        } else if (chartFilter === 'weekly') {
            cutOff = subDays(now, 12 * 7);
        } else if (chartFilter === 'monthly') {
            cutOff = subMonths(now, 12);
        }

        const aggregated = {};
        allData.forEach(m => {
            const date = new Date(m.published_at);

            // Skip data older than the cutoff
            if (date < cutOff) return;

            let key;
            let sortKey;

            if (chartFilter === 'daily') {
                key = format(date, 'dd/MM');
                sortKey = format(date, 'yyyyMMdd');
            } else if (chartFilter === 'weekly') {
                const start = startOfWeek(date, { weekStartsOn: 1 });
                key = `Sem ${format(start, 'dd/MM')}`;
                sortKey = format(start, 'yyyyMMdd');
            } else if (chartFilter === 'monthly') {
                key = format(date, "MMM/yy", { locale: ptBR });
                sortKey = format(date, 'yyyyMM');
            }

            if (!aggregated[key]) aggregated[key] = { name: key, value: 0, sortKey };
            aggregated[key].value += m.impressions;
        });

        return Object.values(aggregated)
            .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [allData, chartFilter]);

    // Weekly Goal Logic (Using Impressions to match the chart)
    const weeklyGoalData = useMemo(() => {
        const now = new Date();
        const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });
        const endOfThisWeek = endOfWeek(now, { weekStartsOn: 1 });

        // Current week total (Impressions)
        const currentWeekImpr = allData
            .filter(m => isWithinInterval(new Date(m.published_at), { start: startOfThisWeek, end: endOfThisWeek }))
            .reduce((acc, curr) => acc + curr.impressions, 0);

        // Target (Manual or Fallback to 1000)
        const target = manualGoal > 0 ? manualGoal : 1000;
        const percent = Math.min(Math.round((currentWeekImpr / target) * 100), 100);

        return {
            progress: [
                { name: 'Alcançado', value: percent },
                { name: 'Restante', value: 100 - percent },
            ],
            current: currentWeekImpr,
            target: target
        };
    }, [allData, manualGoal]);

    const handleSaveGoal = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || '00000000-0000-0000-0000-000000000000';

            await storageService.updateWeeklyGoal(userId, parseInt(tempGoal));
            setManualGoal(parseInt(tempGoal));
            setIsEditingGoal(false);
            toast.success('Meta de impressões atualizada!');
        } catch (error) {
            console.error('Error saving goal:', error);
            toast.error('Erro ao salvar meta.');
        }
    };

    const handleImportSuccess = async (file, content) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || '00000000-0000-0000-0000-000000000000';

            const parsedData = importService.parseLinkedInFile(file, content);
            const result = await importService.saveImportedData(userId, file.name, file.size, parsedData);

            if (result.success) {
                toast.success(`${result.count} registros importados com sucesso!`);
                fetchDashboardData();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error(`Erro na importação: ${error.message}`);
        }
    };

    return (
        <DashboardLayout
            title="Dashboard"
            headerActions={
                <>
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={Upload}
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        Importar Dados
                    </Button>
                </>
            }
        >
            <div className="dashboard-page-container">
                {/* Metrics Cards */}
                <div className="metrics-row">
                    <MetricsCard
                        title="Impressões Totais"
                        value={formatNumber(metrics.totalImpressions)}
                        change={metrics.impressionsChange}
                        icon={Eye}
                        variant="gradient"
                    />
                    <MetricsCard
                        title="Engajamento Total"
                        value={formatNumber(metrics.totalEngagement)}
                        change={metrics.engagementChange}
                        icon={TrendingUp}
                    />
                    <MetricsCard
                        title="Alcance Médio"
                        value={formatNumber(metrics.avgReach)}
                        change={metrics.reachChange}
                        icon={Users}
                    />
                    <MetricsCard
                        title="Posts Públicados"
                        value={metrics.totalPosts}
                        change={metrics.postsChange}
                        icon={Upload}
                    />
                    <MetricsCard
                        title="Seguidores Totais"
                        value={formatNumber(metrics.totalFollowers)}
                        change={metrics.followersChange}
                        icon={Users}
                        variant="secondary"
                        comparisonText="vs última importação"
                    />
                </div>

                {/* Charts Row */}
                <div className="charts-row">
                    <div className="chart-col-large">
                        <Card className="chart-container-card">
                            <div className="chart-header">
                                <div className="chart-title-group">
                                    <h3>Total de Impressões</h3>
                                    <p>Visualizações brutas de suas publicações</p>
                                </div>
                                <div className="chart-filters">
                                    <button
                                        className={`filter-btn ${chartFilter === 'daily' ? 'active' : ''}`}
                                        onClick={() => setChartFilter('daily')}
                                    >Diário</button>
                                    <button
                                        className={`filter-btn ${chartFilter === 'weekly' ? 'active' : ''}`}
                                        onClick={() => setChartFilter('weekly')}
                                    >Semanal</button>
                                    <button
                                        className={`filter-btn ${chartFilter === 'monthly' ? 'active' : ''}`}
                                        onClick={() => setChartFilter('monthly')}
                                    >Mensal</button>
                                </div>
                            </div>
                            <div className="chart-body">
                                <BarChartComponent
                                    data={impressionsChartData}
                                    dataKey="value"
                                    xKey="name"
                                    label="Impressões"
                                    hideHeader
                                    fullHeight
                                />
                            </div>
                        </Card>
                    </div>
                    <div className="chart-col-small">
                        <PieChartComponent
                            data={weeklyGoalData.progress}
                            title="Meta Semanal (Imp.)"
                        />
                        <div className="goal-info">
                            <div className="goal-header">
                                <span>Status da Meta</span>
                                {!isEditingGoal ? (
                                    <button
                                        className="edit-goal-btn"
                                        onClick={() => setIsEditingGoal(true)}
                                        title="Editar Meta"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                ) : (
                                    <div className="edit-goal-actions">
                                        <button className="save-goal-btn" onClick={handleSaveGoal}><Check size={14} /></button>
                                        <button className="cancel-goal-btn" onClick={() => setIsEditingGoal(false)}><X size={14} /></button>
                                    </div>
                                )}
                            </div>

                            {!isEditingGoal ? (
                                <>
                                    <div className="goal-current">{formatNumber(weeklyGoalData.current)}</div>
                                    <div className="goal-target">Alvo: {formatNumber(weeklyGoalData.target)}</div>
                                </>
                            ) : (
                                <div className="goal-edit-container">
                                    <input
                                        type="number"
                                        className="goal-input"
                                        value={tempGoal}
                                        onChange={(e) => setTempGoal(e.target.value)}
                                        autoFocus
                                    />
                                    <span className="goal-input-hint">Defina o engajamento total alvo</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Card className="posts-table-card">
                    <div className="card-header">
                        <div className="header-info">
                            <h3>Posts Recentes</h3>
                            <Badge variant="secondary">{filteredPosts.length} posts</Badge>
                        </div>
                        <div className="table-actions">
                            <div className="items-per-page">
                                <span>Mostrar:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className="table-filters">
                                <button
                                    className={`filter-btn ${postsFilter === '30d' ? 'active' : ''}`}
                                    onClick={() => setPostsFilter('30d')}
                                >30 Dias</button>
                                <button
                                    className={`filter-btn ${postsFilter === '90d' ? 'active' : ''}`}
                                    onClick={() => setPostsFilter('90d')}
                                >90 Dias</button>
                                <button
                                    className={`filter-btn ${postsFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setPostsFilter('all')}
                                >Tudo</button>
                            </div>
                        </div>
                    </div>
                    {recentPosts.length > 0 && (
                        <div className="posts-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Post ID / Link</th>
                                        <th>Data</th>
                                        <th>Engajamento</th>
                                        <th>Impressões</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPosts.map((post) => (
                                        <tr key={post.id}>
                                            <td className="post-title">
                                                <a
                                                    href={post.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="post-link-cell"
                                                >
                                                    {post.title.length > 40 ? post.title.substring(0, 40) + '...' : post.title}
                                                    <ExternalLink size={12} className="link-icon" />
                                                </a>
                                            </td>
                                            <td>{post.date ? new Date(post.date).toLocaleDateString('pt-BR') : 'Data indisponível'}</td>
                                            <td className="metric-value">{formatNumber(post.engagement)}</td>
                                            <td className="metric-value">{formatNumber(post.reach)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredPosts.length > 0 && (
                                <div className="pagination-container">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Anterior
                                    </button>
                                    <div className="pagination-pages">
                                        Página <strong>{currentPage}</strong> de {totalPages || 1}
                                    </div>
                                    <button
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                    >
                                        Próxima
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                {/* Audiência / Demográficos */}
                {Object.keys(demographics).length > 0 && (
                    <div className="demographics-section">
                        <div className="section-header">
                            <h2>Perfil da Audiência</h2>
                            <p>Análise detalhada de quem está consumindo seu conteúdo</p>
                        </div>
                        <div className="demo-grid-bars">
                            {/* Cargos */}
                            {demographics['Cargos'] && (
                                <Card className="demo-card-bar">
                                    <BarChartComponent
                                        data={demographics['Cargos'].slice(0, 8)}
                                        title="Principais Cargos"
                                        layout="horizontal"
                                        xKey="name"
                                        dataKey="value"
                                        height={350}
                                        color="#0ea5e9" // Sky 500
                                        label="Cargos"
                                    />
                                </Card>
                            )}

                            {/* Setores */}
                            {demographics['Setores'] && (
                                <Card className="demo-card-bar">
                                    <BarChartComponent
                                        data={demographics['Setores'].slice(0, 8)}
                                        title="Setores de Atuação"
                                        layout="horizontal"
                                        xKey="name"
                                        dataKey="value"
                                        height={350}
                                        color="#8b5cf6" // Violet 500
                                        label="Setor"
                                    />
                                </Card>
                            )}

                            {/* Localidades */}
                            {demographics['Localidades'] && (
                                <Card className="demo-card-bar">
                                    <BarChartComponent
                                        data={demographics['Localidades'].slice(0, 8)}
                                        title="Localização Geográfica"
                                        layout="horizontal"
                                        xKey="name"
                                        dataKey="value"
                                        height={350}
                                        color="#10b981" // Emerald 500
                                        label="Local"
                                    />
                                </Card>
                            )}

                            {/* Nível de Experiência */}
                            {demographics['Nível de experiência'] && (
                                <Card className="demo-card-bar">
                                    <BarChartComponent
                                        data={demographics['Nível de experiência'].slice(0, 5)}
                                        title="Nível de Senioridade"
                                        layout="horizontal"
                                        xKey="name"
                                        dataKey="value"
                                        height={300}
                                        color="#f59e0b" // Amber 500
                                        label="Nível"
                                    />
                                </Card>
                            )}

                            {/* Tamanho da Empresa */}
                            {demographics['Tamanho da empresa'] && (
                                <Card className="demo-card-bar">
                                    <BarChartComponent
                                        data={demographics['Tamanho da empresa'].slice(0, 5)}
                                        title="Tamanho das Empresas"
                                        layout="horizontal"
                                        xKey="name"
                                        dataKey="value"
                                        height={300}
                                        color="#6366f1" // Indigo 500
                                        label="Tamanho"
                                    />
                                </Card>
                            )}

                            {/* Ranking de Empresas */}
                            {demographics['Empresas'] && (
                                <Card className="demo-card-bar full-width">
                                    <BarChartComponent
                                        data={demographics['Empresas'].slice(0, 10)}
                                        title="Top Empresas Visitantes"
                                        layout="horizontal"
                                        xKey="name"
                                        dataKey="value"
                                        height={400}
                                        color="#ec4899" // Pink 500
                                        label="Empresa"
                                    />
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={handleImportSuccess}
            />
        </DashboardLayout>
    );
}
