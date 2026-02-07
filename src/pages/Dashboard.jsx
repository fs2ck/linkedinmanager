import { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, MessageCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import MetricsCard from '../components/features/MetricsCard';
import { BarChartComponent, PieChartComponent } from '../components/charts/PerformanceChart';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import './Dashboard.css';

export default function Dashboard() {
    const [metrics, setMetrics] = useState({
        totalEngagement: 12450,
        engagementChange: 32,
        avgReach: 8230,
        reachChange: 15,
        totalPosts: 24,
        postsChange: 8,
        avgComments: 45,
        commentsChange: -5,
    });

    const engagementData = [
        { name: 'Seg', value: 58 },
        { name: 'Ter', value: 48 },
        { name: 'Qua', value: 38 },
        { name: 'Qui', value: 27 },
        { name: 'Sex', value: 18 },
    ];

    const goalProgress = [
        { name: 'Alcançado', value: 56 },
        { name: 'Restante', value: 44 },
    ];

    const recentPosts = [
        {
            id: 1,
            title: 'Como a IA está transformando o mercado',
            date: '2026-02-05',
            status: 'published',
            engagement: 245,
            reach: 1200,
        },
        {
            id: 2,
            title: '5 dicas para aumentar produtividade',
            date: '2026-02-03',
            status: 'published',
            engagement: 189,
            reach: 980,
        },
        {
            id: 3,
            title: 'Tendências de tecnologia para 2026',
            date: '2026-02-01',
            status: 'scheduled',
            engagement: 0,
            reach: 0,
        },
    ];

    return (
        <DashboardLayout
            title="Dashboard"
            headerActions={
                <>
                    <Button variant="secondary" size="sm">Exportar CSV</Button>
                    <Button variant="primary" size="sm">Compartilhar</Button>
                </>
            }
        >
            <div className="dashboard-grid">
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
                        title="Posts Publicados"
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
                        <h3>Posts Recentes</h3>
                        <Button variant="ghost" size="sm">Ver todos</Button>
                    </div>
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
                </Card>
            </div>
        </DashboardLayout>
    );
}
