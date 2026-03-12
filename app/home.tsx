import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  Pressable
} from 'react-native';
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
  FileText,
  X,
  User,
  LogOut
} from 'lucide-react-native';
import { LineChart } from "react-native-chart-kit";
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router'; 

const { width } = Dimensions.get('window');
const LogoImg = require('../assets/images/logo.png'); 

// --- COMPONENTE DO ARCO CUSTOMIZADO ---
function AqiGauge({ value }: { value: number }) {
  const size = 180;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = radius * 2 * Math.PI;
  const totalArcLength = circumference * 0.75; 
  const gap = circumference - totalArcLength;
  const percentage = Math.min(value / 500, 1);
  const progressLength = totalArcLength * percentage;

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '135deg' }] }}>
        <Circle cx={center} cy={center} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} strokeDasharray={`${totalArcLength} ${gap}`} strokeLinecap="round" fill="none" />
        <Circle cx={center} cy={center} r={radius} stroke="#84CC16" strokeWidth={strokeWidth} strokeDasharray={`${progressLength} ${circumference}`} strokeLinecap="round" fill="none" />
      </Svg>
      <View style={styles.gaugeTextOverlay}>
        <Text style={styles.gaugeValue}>{value}</Text>
        <Text style={styles.gaugeLabel}>AQI</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const chartData = {
    labels: ["12h", "13h", "14h", "15h", "16h", "17h"],
    datasets: [
      { data: [22, 24.5, 23.8, 25.2, 26, 24.5], color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, strokeWidth: 3 },
      { data: [18, 20, 19, 22, 21, 19], color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, strokeWidth: 3 }
    ],
    legend: ["Temperatura", "Umidade"]
  };

  return (
    <SafeAreaView style={styles.container} key={refreshKey}>
      
      {/* --- TOP BAR --- */}
      <View style={styles.topAppBar}>
        <Image source={LogoImg} style={styles.topLogo} resizeMode="contain" />
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBadge} onPress={() => router.push('/notificacao')}>
            <Bell color="#000" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarCircle} onPress={() => setIsProfileVisible(true)}>
            <Text style={styles.avatarText}>US</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.dashboardHeaderSection}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Visão geral de seus ambientes</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleRefresh}>
            <RefreshCw color="#000" size={18} />
            <Text style={styles.btnSecondaryText}>Atualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary}><Plus color="#FFF" size={18} /><Text style={styles.btnPrimaryText}>Novo Ambiente</Text></TouchableOpacity>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard label="Temperatura Média" value="24,5" unit="°C" trend="+0,5%" trendUp={true} icon={<Thermometer color="#FFF" size={32} />} iconBg="#10B981" />
          <MetricCard label="Umidade Média" value="43" unit="%" trend="-0,5%" trendUp={false} icon={<Droplets color="#FFF" size={32} />} iconBg="#10B981" />
          <MetricCard label="CO₂ Médio" value="764" unit="ppm" icon={<LayoutGrid color="#FFF" size={32} />} iconBg="#10B981" />
          <MetricCard label="Ambientes Ativos" value="4" unit="Locais" icon={<Building2 color="#FFF" size={32} />} iconBg="#2563EB" />
        </View>

        {/* --- GRÁFICO --- */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Histórico das Últimas Horas</Text>
          <LineChart
            data={chartData}
            width={width - 60}
            height={200}
            fromZero={true}
            chartConfig={{ backgroundColor: "#FFF", backgroundGradientFrom: "#FFF", backgroundGradientTo: "#FFF", decimalPlaces: 1, color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})` }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16, marginLeft: -20 }}
          />
        </View>

        {/* --- AQI GAUGE --- */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitleCenter}>Qualidade do Ar Geral</Text>
          <AqiGauge value={64} />
          <Text style={styles.statusText}>Bom</Text>
          <Text style={styles.statusSub}>Média de todos os ambientes controlados</Text>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Seus Ambientes</Text>
          <TouchableOpacity onPress={() => router.push('/ambientes')}>
            <Text style={styles.viewAll}>Ver Todos →</Text>
          </TouchableOpacity>
        </View>

        <RoomCard name="Sala 1" type="Salas" temp="23,5°" hum="45%" aqi="45" icon={<LayoutGrid color="#10B981" size={24}/>} />
        <RoomCard name="Escritório 1" type="Escritórios" temp="22,8°" hum="52%" aqi="32" icon={<Building2 color="#10B981" size={24}/>} />

        <View style={{height: 100}} /> 
      </ScrollView>

      {/* --- MODAL DE PERFIL --- */}
      <Modal animationType="fade" transparent={true} visible={isProfileVisible} onRequestClose={() => setIsProfileVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsProfileVisible(false)} />
          <View style={styles.profileSheet}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileTitle}>Perfil</Text>
              <TouchableOpacity onPress={() => setIsProfileVisible(false)}>
                <X color="#94A3B8" size={30} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileUserInfo}>
              <View style={styles.largeAvatar}><Text style={styles.largeAvatarText}>US</Text></View>
              <Text style={styles.userName}>Usuário</Text>
              <Text style={styles.userEmail}>usuario@empresa.com</Text>
            </View>

            <View style={styles.separator} />
            <Text style={styles.configLabel}>Configurações</Text>
            
            {/* BOTÃO MINHA CONTA */}
            <TouchableOpacity style={styles.configItem} onPress={() => { setIsProfileVisible(false); router.push('/profile'); }}>
              <View style={styles.configItemLeft}>
                <View style={styles.configIconBox}><User color="#1E293B" size={22} /></View>
                <View>
                  <Text style={styles.configItemTitle}>Minha Conta</Text>
                  <Text style={styles.configItemSub}>Dados Pessoais</Text>
                </View>
              </View>
              <ChevronRight color="#1E293B" size={20} />
            </TouchableOpacity>

            {/* BOTÃO SAIR (ABAIXO DE MINHA CONTA) */}
            <TouchableOpacity style={[styles.btnSignOut, { marginTop: 25 }]} onPress={() => { setIsProfileVisible(false); router.replace('/'); }}>
              <LogOut color="#EF4444" size={20} />
              <Text style={styles.btnSignOutText}>Sair da conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- BOTTOM TAB --- */}
      <View style={styles.bottomTab}>
        <TabItem icon={<FileText size={24} color="#2563EB" />} active />
        <TabItem icon={<Building2 size={24} color="#64748B" />} onPress={() => router.push('/ambientes')} />
        <TabItem icon={<Zap size={24} color="#64748B" />} />
        <TabItem icon={<Bell size={24} color="#64748B" />} onPress={() => router.push('/notificacao')} />
        <TabItem icon={<BarChart3 size={24} color="#64748B" />} />
      </View>
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topAppBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 5, backgroundColor: '#FFF' },
  topLogo: { width: 140, height: 60 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBadge: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  dashboardHeaderSection: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#000' },
  headerSubtitle: { fontSize: 14, color: '#64748B' },
  scrollContent: { paddingBottom: 20 },
  actionRow: { flexDirection: 'row', gap: 12, marginVertical: 20, paddingHorizontal: 20 },
  btnSecondary: { flex: 1, height: 45, backgroundColor: '#FFF', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  btnPrimary: { flex: 1.5, height: 45, backgroundColor: '#2563EB', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSecondaryText: { fontWeight: '600', color: '#000' },
  btnPrimaryText: { fontWeight: '600', color: '#FFF' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, gap: 12 },
  metricCard: { width: (width / 2) - 26, height: 155, backgroundColor: '#FFF', borderRadius: 22, padding: 15, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  metricIcon: { width: 58, height: 58, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  trendBadge: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 },
  trendText: { fontSize: 11, fontWeight: '800' },
  metricTextContainer: { marginTop: 0 },
  metricLabel: { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  metricValue: { fontSize: 26, fontWeight: 'bold', color: '#1E293B' },
  metricUnit: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginTop: 20, marginHorizontal: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  sectionTitleCenter: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 10 },
  gaugeContainer: { alignItems: 'center', justifyContent: 'center', height: 180 },
  gaugeTextOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  gaugeValue: { fontSize: 44, fontWeight: 'bold', color: '#1E293B' },
  gaugeLabel: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  statusText: { fontSize: 22, fontWeight: 'bold', color: '#84CC16', textAlign: 'center', marginTop: 10 },
  statusSub: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 5 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15, paddingHorizontal: 20 },
  viewAll: { color: '#2563EB', fontWeight: '600' },
  roomCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#ECFDF5', marginHorizontal: 20 },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  roomInfoMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roomIconBox: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center' },
  roomName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  roomType: { fontSize: 12, color: '#64748B' },
  roomMetrics: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  roomMetricItem: { alignItems: 'center', gap: 4 },
  roomMetricValue: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  roomMetricLabel: { fontSize: 11, color: '#94A3B8' },
  bottomTab: { position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#FFF', flexDirection: 'row', borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: 15 },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeIndicator: { position: 'absolute', bottom: 10, width: 4, height: 4, borderRadius: 2, backgroundColor: '#2563EB' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row' },
  modalBackdrop: { flex: 0.15 },
  profileSheet: { flex: 0.85, backgroundColor: '#FFF', padding: 24, paddingTop: 60, borderTopLeftRadius: 30, borderBottomLeftRadius: 30 },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  profileTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  profileUserInfo: { alignItems: 'center', marginBottom: 20 },
  largeAvatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  largeAvatarText: { color: '#FFF', fontSize: 30, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  userEmail: { fontSize: 14, color: '#64748B' },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 25 },
  configLabel: { fontSize: 14, color: '#94A3B8', marginBottom: 20 },
  configItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  configItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  configIconBox: { width: 45, height: 45, backgroundColor: '#F8FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  configItemTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  configItemSub: { fontSize: 12, color: '#94A3B8' },
  btnSignOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#EF4444', borderRadius: 15, height: 55 },
  btnSignOutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});

// --- COMPONENTES AUXILIARES ---
function MetricCard({ label, value, unit, trend, trendUp, icon, iconBg }: any) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, {backgroundColor: iconBg}]}>{icon}</View>
        {trend && (
          <View style={[styles.trendBadge, {backgroundColor: trendUp ? '#D1FAE5' : '#FEE2E2'}]}>
            <Text style={[styles.trendText, {color: trendUp ? '#059669' : '#DC2626'}]}>{trendUp ? '↗' : '↘'} {trend}</Text>
          </View>
        )}
      </View>
      <View style={styles.metricTextContainer}>
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={styles.metricValueRow}>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricUnit}>{unit}</Text>
        </View>
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
          <View><Text style={styles.roomName}>{name}</Text><Text style={styles.roomType}>{type}</Text></View>
        </View>
        <ChevronRight color="#64748B" size={20} />
      </View>
      <View style={styles.roomMetrics}>
        <View style={styles.roomMetricItem}><Thermometer size={16} color="#EF4444" /><Text style={styles.roomMetricValue}>{temp}</Text><Text style={styles.roomMetricLabel}>Temp</Text></View>
        <View style={styles.roomMetricItem}><Droplets size={16} color="#3B82F6" /><Text style={styles.roomMetricValue}>{hum}</Text><Text style={styles.roomMetricLabel}>Umidade</Text></View>
        <View style={styles.roomMetricItem}><Wind size={16} color="#10B981" /><Text style={styles.roomMetricValue}>{aqi}</Text><Text style={styles.roomMetricLabel}>AQI</Text></View>
      </View>
    </TouchableOpacity>
  );
}

function TabItem({ icon, active, onPress }: any) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      {icon}
      {active && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
}