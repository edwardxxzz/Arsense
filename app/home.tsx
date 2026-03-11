import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bell, 
  RefreshCw, 
  Plus, 
  Thermometer, 
  Droplets, 
  Wind, 
  LayoutGrid, 
  Building2, 
  Zap, 
  BarChart3, 
  ChevronRight,
  User
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Visão geral de seus ambientes</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBadge}>
            <Bell color="#000" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarCircle}>
             <Text style={styles.avatarText}>US</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* BOTÕES DE AÇÃO */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnSecondary}>
            <RefreshCw color="#000" size={18} />
            <Text style={styles.btnSecondaryText}>Atualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary}>
            <Plus color="#FFF" size={18} />
            <Text style={styles.btnPrimaryText}>Novo Ambiente</Text>
          </TouchableOpacity>
        </View>

        {/* CARDS DE MÉTRICAS MÉDIAS */}
        <View style={styles.metricsGrid}>
          <MetricCard 
            label="Temperatura Média" 
            value="24,5" 
            unit="°C" 
            trend="+0,5%" 
            trendUp={true} 
            icon={<Thermometer color="#FFF" size={20} />} 
            iconBg="#10B981" 
          />
          <MetricCard 
            label="Umidade Média" 
            value="43" 
            unit="%" 
            trend="-0,5%" 
            trendUp={false} 
            icon={<Droplets color="#FFF" size={20} />} 
            iconBg="#10B981" 
          />
          <MetricCard 
            label="CO₂ Médio" 
            value="764" 
            unit="ppm" 
            icon={<LayoutGrid color="#FFF" size={20} />} 
            iconBg="#10B981" 
          />
          <MetricCard 
            label="Ambientes Ativos" 
            value="4" 
            unit="Locais" 
            icon={<Building2 color="#FFF" size={20} />} 
            iconBg="#2563EB" 
          />
        </View>

        {/* SEÇÃO GRÁFICO (Simulado) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Histórico das Últimas Horas</Text>
          <View style={styles.chartPlaceholder}>
             {/* Aqui entraria sua lib de gráfico. Simulando a área visual da imagem */}
             <View style={styles.chartMock} />
             <View style={styles.chartLegend}>
                <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: '#EF4444'}]}/><Text style={styles.legendText}>Temperatura</Text></View>
                <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: '#3B82F6'}]}/><Text style={styles.legendText}>Umidade</Text></View>
             </View>
          </View>
        </View>

        {/* QUALIDADE DO AR GERAL (Gauge) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitleCenter}>Qualidade do Ar Geral</Text>
          <View style={styles.gaugeContainer}>
            <View style={styles.gaugeOuter}>
               <Text style={styles.gaugeValue}>64</Text>
               <Text style={styles.gaugeLabel}>AQI</Text>
            </View>
            <Text style={styles.statusText}>Bom</Text>
            <Text style={styles.statusSub}>Média de todos os ambientes controlados</Text>
          </View>
        </View>

        {/* LISTA DE AMBIENTES */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Seus Ambientes</Text>
          <TouchableOpacity><Text style={styles.viewAll}>Ver Todos →</Text></TouchableOpacity>
        </View>

        <RoomCard name="Sala 1" type="Salas" temp="23,5°" hum="45%" aqi="45" icon={<LayoutGrid color="#10B981" size={24}/>} />
        <RoomCard name="Escritório 1" type="Escritórios" temp="22,8°" hum="52%" aqi="32" icon={<Building2 color="#10B981" size={24}/>} />
        <RoomCard name="Sala 2" type="Salas" temp="26,2°" hum="52%" aqi="38" icon={<LayoutGrid color="#10B981" size={24}/>} />
        <RoomCard name="Escritório 2" type="Escritórios" temp="24,0°" hum="55%" aqi="32" icon={<Building2 color="#10B981" size={24}/>} />

        <View style={{height: 100}} /> 
      </ScrollView>

      {/* BOTTOM TAB NAVIGATOR (5 Items) */}
      <View style={styles.bottomTab}>
        <TabItem icon={<BarChart3 size={24} color="#2563EB" />} active />
        <TabItem icon={<Building2 size={24} color="#64748B" />} />
        <TabItem icon={<Zap size={24} color="#64748B" />} />
        <TabItem icon={<Bell size={24} color="#64748B" />} />
        <TabItem icon={<BarChart3 size={24} color="#64748B" style={{transform: [{rotate: '90deg'}]}} />} />
      </View>
    </SafeAreaView>
  );
}

// COMPONENTES AUXILIARES
function MetricCard({ label, value, unit, trend, trendUp, icon, iconBg }: any) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, {backgroundColor: iconBg}]}>{icon}</View>
        {trend && (
          <View style={[styles.trendBadge, {backgroundColor: trendUp ? '#D1FAE5' : '#FEE2E2'}]}>
            <Text style={[styles.trendText, {color: trendUp ? '#059669' : '#DC2626'}]}>{trend}</Text>
          </View>
        )}
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
    </View>
  );
}

function RoomCard({ name, type, temp, hum, aqi, icon }: any) {
  return (
    <TouchableOpacity style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View style={styles.roomInfoMain}>
          <View style={styles.roomIconBox}>{icon}</View>
          <View>
            <Text style={styles.roomName}>{name}</Text>
            <Text style={styles.roomType}>{type}</Text>
          </View>
        </View>
        <ChevronRight color="#64748B" size={20} />
      </View>
      <View style={styles.roomMetrics}>
        <View style={styles.roomMetricItem}>
          <Thermometer size={16} color="#EF4444" />
          <Text style={styles.roomMetricValue}>{temp}</Text>
          <Text style={styles.roomMetricLabel}>Temp</Text>
        </View>
        <View style={styles.roomMetricItem}>
          <Droplets size={16} color="#3B82F6" />
          <Text style={styles.roomMetricValue}>{hum}</Text>
          <Text style={styles.roomMetricLabel}>Umidade</Text>
        </View>
        <View style={styles.roomMetricItem}>
          <Wind size={16} color="#10B981" />
          <Text style={styles.roomMetricValue}>{aqi}</Text>
          <Text style={styles.roomMetricLabel}>AQI</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TabItem({ icon, active }: any) {
  return (
    <TouchableOpacity style={styles.tabItem}>
      {icon}
      {active && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#FFF'
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  headerSubtitle: { fontSize: 14, color: '#64748B' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBadge: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  
  actionRow: { flexDirection: 'row', gap: 12, marginVertical: 20 },
  btnSecondary: { flex: 1, height: 45, backgroundColor: '#FFF', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  btnPrimary: { flex: 1.5, height: 45, backgroundColor: '#2563EB', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSecondaryText: { fontWeight: '600', color: '#000' },
  btnPrimaryText: { fontWeight: '600', color: '#FFF' },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  metricCard: { width: (width - 52) / 2, backgroundColor: '#FFF', borderRadius: 16, padding: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  metricIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  trendBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  trendText: { fontSize: 11, fontWeight: 'bold' },
  metricLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  metricValue: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  metricUnit: { fontSize: 12, color: '#94A3B8' },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginTop: 20, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  sectionTitleCenter: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 20 },
  chartPlaceholder: { 
    marginTop: 5,
    alignItems: 'center' 
  },
  chartMock: { height: 150, backgroundColor: '#F8FAFC', borderRadius: 10, borderBottomWidth: 1, borderLeftWidth: 1, borderColor: '#E2E8F0' },
  chartLegend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#64748B' },

  gaugeContainer: { alignItems: 'center', paddingVertical: 10 },
  gaugeOuter: { width: 150, height: 150, borderRadius: 75, borderWidth: 12, borderColor: '#F1F5F9', borderTopColor: '#84CC16', justifyContent: 'center', alignItems: 'center' },
  gaugeValue: { fontSize: 42, fontWeight: 'bold', color: '#1E293B' },
  gaugeLabel: { fontSize: 14, color: '#94A3B8' },
  statusText: { fontSize: 20, fontWeight: 'bold', color: '#84CC16', marginTop: 15 },
  statusSub: { fontSize: 12, color: '#94A3B8', marginTop: 5 },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15 },
  viewAll: { color: '#2563EB', fontWeight: '600' },

  roomCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#ECFDF5' },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  roomInfoMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roomIconBox: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center' },
  roomName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  roomType: { fontSize: 12, color: '#64748B' },
  roomMetrics: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  roomMetricItem: { alignItems: 'center', gap: 4 },
  roomMetricValue: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  roomMetricLabel: { fontSize: 11, color: '#94A3B8' },

  bottomTab: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    height: 70, 
    backgroundColor: '#FFF', 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderColor: '#E2E8F0',
    paddingBottom: 10
  },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeIndicator: { position: 'absolute', bottom: 10, width: 4, height: 4, borderRadius: 2, backgroundColor: '#2563EB' }
});