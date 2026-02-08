import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './PerformanceChart.css';

export function BarChartComponent({
    data,
    dataKey,
    xKey,
    title,
    label,
    fullHeight = false,
    hideHeader = false,
    layout = 'horizontal', // 'horizontal' (default) or 'vertical'
    color = "var(--color-primary-500)"
}) {
    return (
        <div className={`chart-container ${fullHeight ? 'chart-full-height' : ''}`}>
            {!hideHeader && title && <h3 className="chart-title">{title}</h3>}
            <div style={{ flex: fullHeight ? 1 : 'none', minHeight: fullHeight ? 0 : 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height={fullHeight ? '100%' : 300}>
                    <BarChart
                        data={data}
                        layout={layout}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />

                        {/* 
                           If layout is horizontal (standard): XAxis = Category (xKey), YAxis = Value
                           If layout is vertical (sideways): XAxis = Value (type="number"), YAxis = Category (dataKey=xKey, type="category")
                        */}
                        {layout === 'horizontal' ? (
                            <>
                                <XAxis dataKey={xKey} stroke="var(--text-tertiary)" tick={{ fontSize: 12 }} interval={0} />
                                <YAxis stroke="var(--text-tertiary)" tick={{ fontSize: 12 }} />
                            </>
                        ) : (
                            <>
                                <XAxis type="number" stroke="var(--text-tertiary)" tick={{ fontSize: 12 }} hide />
                                <YAxis dataKey={xKey} type="category" width={150} stroke="var(--text-tertiary)" tick={{ fontSize: 11 }} />
                            </>
                        )}

                        <Tooltip
                            cursor={{ fill: 'var(--bg-secondary)', opacity: 0.4 }}
                            labelFormatter={(value) => label ? `${label}: ${value}` : value}
                            formatter={(value) => [
                                (value !== null && value !== undefined) ? `${value}%` : '0%',
                                label || 'Porcentagem'
                            ]}
                            contentStyle={{
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-primary)'
                            }}
                        />
                        <Bar
                            dataKey={dataKey}
                            fill={color}
                            radius={layout === 'horizontal' ? [4, 4, 0, 0] : [0, 4, 4, 0]}
                            barSize={layout === 'horizontal' ? undefined : 20}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function PieChartComponent({ data, title }) {
    const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];

    return (
        <div className="chart-container">
            {title && <h3 className="chart-title">{title}</h3>}
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
                {data.map((entry, index) => (
                    <div key={entry.name} className="legend-item">
                        <span
                            className="legend-color"
                            style={{ background: COLORS[index % COLORS.length] }}
                        />
                        <span className="legend-label">{entry.name}</span>
                        <span className="legend-value">
                            {(entry.value !== null && entry.value !== undefined) ? entry.value : 0}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
