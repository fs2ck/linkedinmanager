import { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, MessageCircle, Upload } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import MetricsCard from '../components/features/MetricsCard';
import { BarChartComponent, PieChartComponent } from '../components/charts/PerformanceChart';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ImportModal from '../components/features/ImportModal';
import { importService } from '../services/storage/importService';
import { supabase } from '../services/storage/supabaseService';
import { toast } from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [metrics, setMetrics] = useState({
        totalEngagement: 0,
        engagementChange: 0,
        avgReach: 0,
        reachChange: 0,
        totalPosts: 0,
        postsChange: 0,
        avgComments: 0,
        commentsChange: 0,
    });

    const [engagementData, setEngagementData] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('metrics_history')
                .select('*')
                .eq('user_id', user.id)
                .order('published_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                // Process metrics
                const totalEngagement = data.reduce((acc, curr) => acc + curr.reactions + curr.comments + curr.shares, 0);
                const totalImpressions = data.reduce((acc, curr) => acc + curr.impressions, 0);
                const avgReach = Math.round(totalImpressions / data.length);
                const avgComments = Math.round(data.reduce((acc, curr) => acc + curr.comments, 0) / data.length);

                setMetrics({
                    totalEngagement,
                    engagementChange: 12, // Still mock change for now
                    avgReach,
                    reachChange: 8,
                    totalPosts: data.length,
                    postsChange: 2,
                    avgComments,
                    commentsChange: -3,
                });

                // Recent posts table
                setRecentPosts(data.slice(0, 5).map(m => ({
                    id: m.id,
                    title: m.title,
                    date: m.published_at,
                    status: 'published',
                    engagement: m.reactions + m.comments + m.shares,
                    reach: m.impressions
                })));

                // Engagement chart data (last 7 entries)
                const chartData = data.slice(0, 7).reverse().map(m => ({
                    name: new Date(m.published_at).toLocaleDateString('pt-BR', { weekday: 'short' }),
                    value: m.reactions + m.comments + m.shares
                }));
                setEngagementData(chartData);
            } else {
                // Default fallback if no data
                setEngagementData([
                    { name: 'Seg', value: 0 },
                    { name: 'Ter', value: 0 },
                    { name: 'Qua', value: 0 },
                    { name: 'Qui', value: 0 },
                    { name: 'Sex', value: 0 },
                ]);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Erro ao carregar dados do dashboard.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImportSuccess = async (file, content) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const parsedData = importService.parseLinkedInCSV(content);
            const result = await importService.saveImportedData(user.id, file.name, file.size, parsedData);

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

    const goalProgress = [
        { name: 'Alcançado', value: 56 },
        { name: 'Restante', value: 44 },
    ];

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
                    <Button variant="primary" size="sm">Compartilhar</Button>
                </>
            }
        >
            <div className="dashboard-page-container">
                {/* Metrics Cards */}
                <div className="metrics-row">
                    <MetricsCard
                        title="Engajamento Total"
                        value={metrics.totalEngagement.toLocaleString()}
                        change={metrics.engagementChange}
                        icon={TrendingUp}
                        variant="gradient"
                    />
                    <MetricsCard
                        title="Alcance Médio"
                        value={metrics.avgReach.toLocaleString()}
                        change={metrics.reachChange}
                        icon={Eye}
                    />
                    <MetricsCard
                        title="Posts Públicados"
                        value={metrics.totalPosts}
                        change={metrics.postsChange}
                        icon={Users}
                    />
                    <MetricsCard
                        title="Comentários Médios"
                        value={metrics.avgComments}
                        change={metrics.commentsChange}
                        icon={MessageCircle}
                    />
                </div>

                {/* Charts Row */}
                <div className="charts-row">
                    <div className="chart-col-large">
                        <BarChartComponent
                            data={engagementData}
                            dataKey="value"
                            xKey="name"
                            title="Engajamento Semanal"
                            fullHeight
                        />
                    </div>
                    <div className="chart-col-small">
                        <PieChartComponent
                            data={goalProgress}
                            title="Meta Semanal"
                        />
                        <div className="goal-info">
                            <div className="goal-current">28.56K</div>
                            <div className="goal-target">Meta: €50K</div>
                        </div>
                    </div>
                </div>

                {/* Recent Posts Table */}
                <Card className="posts-table-card">
                    <div className="card-header-row">
                        <h3>{recentPosts.length > 0 ? 'Posts Recentes' : 'Nenhuma postagem encontrada'}</h3>
                        <Button variant="ghost" size="sm">Ver todos</Button>
                    </div>
                    {recentPosts.length > 0 && (
                        <div className="posts-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Data</th>
                                        <th>Status</th>
                                        <th>Engajamento</th>
                                        <th>Alcance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPosts.map((post) => (
                                        <tr key={post.id}>
                                            <td className="post-title">{post.title}</td>
                                            <td>{new Date(post.date).toLocaleDateString('pt-BR')}</td>
                                            <td>
                                                <Badge
                                                    variant={post.status === 'published' ? 'success' : 'warning'}
                                                >
                                                    {post.status === 'published' ? 'Publicado' : 'Agendado'}
                                                </Badge>
                                            </td>
                                            <td className="metric-value">{post.engagement}</td>
                                            <td className="metric-value">{post.reach.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={handleImportSuccess}
            />
        </DashboardLayout>
    );
}
