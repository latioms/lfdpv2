"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useServices } from "@/hooks/useService"
import {
  getLastSixMonthsRevenue,
  getCategorySales,
  getTopSellingProducts,
  getStockLevels,
  getProductSalesDistribution,
  TopProduct,
  CategorySales
} from "@/lib/stats.data"
import { 
  BarChart, LineChart, PieChart, CartesianGrid, 
  XAxis, YAxis, Tooltip, Bar, Line, Pie, Cell,
  Label, LabelList, ResponsiveContainer 
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"


export default function StatsPage() {
  const { orders, products, categories } = useServices()
  interface MonthlyRevenue {
    month: string;
    revenue: number;
  }
  const [revenueData, setRevenueData] = useState<MonthlyRevenue[]>([])
  const [categoryData, setCategoryData] = useState<CategorySales[]>([])
  const [productsData, setProductsData] = useState<TopProduct[]>([])
  const [stockData, setStockData] = useState<StockLevel[]>([])
  const [productSalesDistribution, setProductSalesDistribution] = useState<Array<{
    name: string;
    value: number;
    percentage: number;
  }>>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          { orders: ordersData, items: orderItems }, 
          productsData, 
          categoriesData
        ] = await Promise.all([
          orders.getOrdersWithItemsAndProducts(),
          products.getAll(),
          categories.getAll()
        ]);

        console.log('Données chargées:', {
          orders: ordersData,
          items: orderItems,
          products: productsData,
          categories: categoriesData
        });

        setRevenueData(getLastSixMonthsRevenue(ordersData));
        setCategoryData(getCategorySales(ordersData, orderItems, productsData, categoriesData, 'month'));
        setProductsData(getTopSellingProducts(ordersData, orderItems, productsData));
        setStockData(getStockLevels(productsData));
        setProductSalesDistribution(getProductSalesDistribution(ordersData, orderItems, productsData));
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, [])

  // Calcul des tendances
  const calculateTrend = (data: string | any[], key: string) => {
    if (data.length < 2) return { percentage: 0, isUp: true }
    const current = data[data.length - 1][key]
    const previous = data[data.length - 2][key]
    const percentage = ((current - previous) / previous) * 100
    return { percentage: Math.abs(percentage).toFixed(1), isUp: percentage > 0 }
  }

  // Les couleurs pour le camembert
  const PIE_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>
      
      {/* Evolution du CA - Pleine largeur */}
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Évolution du CA</CardTitle>
            <CardDescription>6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `${value.toLocaleString()} XAF`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  strokeWidth={2}
                >
                  <LabelList
                    position="top"
                    formatter={(value) => `${(value/1000000).toFixed(1)}M`}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2">
            {calculateTrend(revenueData, 'revenue').isUp ? (
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-4 w-4" />
                Hausse de {calculateTrend(revenueData, 'revenue').percentage}%
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <TrendingDown className="h-4 w-4" />
                Baisse de {calculateTrend(revenueData, 'revenue').percentage}%
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Grille 1x3 sur mobile, 3x1 sur desktop pour les autres graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ventes par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des ventes</CardTitle>
            <CardDescription>Par catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="sales"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  label
                >
                  <Label
                    content={({ viewBox: { cx, cy } }) => (
                      <text
                        x={cx}
                        y={cy}
                        fill="#888"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        <tspan x={cx} y={cy-10} className="text-xl font-bold">
                          {categoryData.reduce((acc, curr) => acc + curr.sales, 0)}
                        </tspan>
                        <tspan x={cx} y={cy+10}>
                          Total
                        </tspan>
                      </text>
                    )}
                  />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top produits */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produits</CardTitle>
            <CardDescription>Les plus vendus</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={productsData}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <Tooltip />
                <Bar 
                  dataKey="salesCount" 
                  radius={[0, 4, 4, 0]}
                >
                  <LabelList dataKey="salesCount" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution des ventes */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution des ventes</CardTitle>
            <CardDescription>Par produit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productSalesDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#8884d8"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                      >
                        {`${value} (${productSalesDistribution[index].percentage.toFixed(1)}%)`}
                      </text>
                    );
                  }}
                >
                  {productSalesDistribution.map((entry, index) => (
                    <Cell 
                      key={entry.name}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} unités (${productSalesDistribution.find(item => item.name === name)?.percentage.toFixed(1)}%)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="flex justify-center flex-wrap gap-2">
            {productSalesDistribution.map((entry, index) => (
              <div 
                key={`legend-${index}`}
                className="flex items-center gap-2"
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="text-sm">{entry.name}</span>
              </div>
            ))}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}