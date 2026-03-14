import React, { useState, useEffect } from 'react';
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
  Pressable,
  Alert
} from 'react-native';
import { 
  Bell, RefreshCw, Plus, Thermometer, Droplets, Wind, 
  LayoutGrid, Building2, Zap, BarChart3, ChevronRight,
  FileText, X, User, LogOut
} from 'lucide-react-native';
import { LineChart } from "react-native-chart-kit";
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router'; 

// --- INCLUSÃO FIREBASE ---
import { auth, database } from '../services/firebaseConfig';
import { ref, onValue } from "firebase/database";
import { signOut } from "firebase/auth";

const { width } = Dimensions.get('window');
const LogoImg = require('../assets/images/logo.png'); 

interface AmbienteData {
  id: string;
  nomeExibicao: string;
  temperatura: number;
  umidade: number;
  co2: number;
}

function AqiGauge({ value }: { value: number }) {
  const size = 180;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = radius * 2 * Math.PI;
  const totalArcLength = circumference * 0.75; 
  const gap = circumference - totalArcLength;
  const percentage = Math.min(value / 1000, 1); // Ajustado para escala comum de CO2/AQI
  const progressLength = totalArcLength * percentage;

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '135deg' }] }}>
        <Circle cx={center} cy={center} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} strokeDasharray={`${totalArcLength} ${gap}`} strokeLinecap="round" fill="none" />
        <Circle cx={center} cy={center} r={radius} stroke="#84CC16" strokeWidth={strokeWidth} strokeDasharray={`${progressLength} ${circumference}`} strokeLinecap="round" fill="none" />
      </Svg>
      <View style={styles.gaugeTextOverlay}>
        <Text style={styles.gaugeValue}>{value}</Text>
        <Text style={styles.gaugeLabel}>PPM</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  const [userData, setUserData] = useState({ 
    nome: 'Carregando...', 
    email: '', 
    iniciais: '..' 
  });

  const [ambientes, setAmbientes] = useState<AmbienteData[]>([]);
  const [medias, setMedias] = useState({ temp: 0, hum: 0, co2: 0 });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const empresasRef = ref(database, 'empresas');
      
      onValue(empresasRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          let nomeEncontrado = user.displayName || "Usuário";
          let listaAmbientes: AmbienteData[] = [];
          
          Object.keys(data).forEach(empresaKey => {
            const empresaNode = data[empresaKey];
            const usuarios = empresaNode.usuarios;

            if (usuarios) {
              const usuarioPertence = Object.values(usuarios).some((u: any) => u.uid === user.uid);
              
              if (usuarioPertence) {
                Object.keys(usuarios).forEach(uk => {
                  if (usuarios[uk].uid === user.uid) nomeEncontrado = uk.replace(/_/g, ' ');
                });

                const ambientesNode = empresaNode.ambientes;
                if (ambientesNode) {
                  Object.keys(ambientesNode).forEach(ambKey => {
                    const sensores = ambientesNode[ambKey].sensores;
                    if (sensores) {
                      listaAmbientes.push({
                        id: ambKey,
                        nomeExibicao: ambKey.replace(/_/g, ' '),
                        temperatura: Number(sensores.Temperatura) || 0,
                        umidade: Number(sensores.Umidade) || 0,
                        co2: Number(sensores.CO2) || 0
                      });
                    }
                  });
                }
              }
            }
          });

          // Cálculo das Médias
          if (listaAmbientes.length > 0) {
            const t = listaAmbientes.reduce((acc, curr) => acc + curr.temperatura, 0) / listaAmbientes.length;
            const h = listaAmbientes.reduce((acc, curr) => acc + curr.umidade, 0) / listaAmbientes.length;
            const c = listaAmbientes.reduce((acc, curr) => acc + curr.co2, 0) / listaAmbientes.length;
            setMedias({ temp: parseFloat(t.toFixed(1)), hum: Math.round(h), co2: Math.round(c) });
          }

          const iniciais = nomeEncontrado.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').slice(0, 2).toUpperCase();
          setUserData({ nome: nomeEncontrado, email: user.email || "", iniciais });
          setAmbientes(listaAmbientes);
        }
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileVisible(false);
      router.replace('/');
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair.");
    }
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
      <View style={styles.topAppBar}>
        <Image source={LogoImg} style={styles.topLogo} resizeMode="contain" />
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBadge} onPress={() => router.push('/notificacao')}>
            <Bell color="#000" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarCircle} onPress={() => setIsProfileVisible(true)}>
            <Text style={styles.avatarText}>{userData.iniciais}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.dashboardHeaderSection}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Visão geral de seus ambientes</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => setRefreshKey(k => k + 1)}>
            <RefreshCw color="#000" size={18} />
            <Text style={styles.btnSecondaryText}>Atualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/add_ambiente')}>
            <Plus color="#FFF" size={18} />
            <Text style={styles.btnPrimaryText}>Novo Ambiente</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard label="Temp. Média" value={medias.temp} unit="°C" icon={<Thermometer color="#FFF" size={32} />} iconBg="#10B981" />
          <MetricCard label="Umidade Média" value={medias.hum} unit="%" icon={<Droplets color="#FFF" size={32} />} iconBg="#10B981" />
          <MetricCard label="CO₂ Médio" value={medias.co2} unit="ppm" icon={<LayoutGrid color="#FFF" size={32} />} iconBg="#10B981" />
          <MetricCard label="Ambientes" value={ambientes.length} unit="Locais" icon={<Building2 color="#FFF" size={32} />} iconBg="#2563EB" />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Histórico das Últimas Horas</Text>
          <LineChart
            data={chartData}
            width={width - 60}
            height={200}
            chartConfig={{ backgroundColor: "#FFF", backgroundGradientFrom: "#FFF", backgroundGradientTo: "#FFF", decimalPlaces: 1, color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})` }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16, marginLeft: -20 }}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitleCenter}>Qualidade do Ar Geral</Text>
          <AqiGauge value={medias.co2} />
          <Text style={[styles.statusText, { color: medias.co2 < 800 ? '#84CC16' : '#EAB308' }]}>
            {medias.co2 < 800 ? 'Excelente' : 'Regular'}
          </Text>
          <Text style={styles.statusSub}>Média baseada em todos os sensores</Text>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Seus Ambientes</Text>
          <TouchableOpacity onPress={() => router.push('/ambientes')}>
            <Text style={styles.viewAll}>Ver Todos →</Text>
          </TouchableOpacity>
        </View>

        {ambientes.slice(0, 2).map((item) => (
          <RoomCard 
            key={item.id}
            name={item.nomeExibicao} 
            type="Monitorado" 
            temp={`${item.temperatura}°`} 
            hum={`${item.umidade}%`} 
            aqi={item.co2} 
            icon={<LayoutGrid color="#10B981" size={24}/>} 
            onPress={() => router.push('/ambiente')}
          />
        ))}

        <View style={{height: 100}} /> 
      </ScrollView>

      {/* --- MODAL DE PERFIL --- */}
      <Modal animationType="fade" transparent={true} visible={isProfileVisible} onRequestClose={() => setIsProfileVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsProfileVisible(false)} />
          <View style={styles.profileSheet}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileTitle}>Perfil</Text>
              <TouchableOpacity onPress={() => setIsProfileVisible(false)}><X color="#94A3B8" size={30} /></TouchableOpacity>
            </View>
            <View style={styles.profileUserInfo}>
              <View style={styles.largeAvatar}><Text style={styles.largeAvatarText}>{userData.iniciais}</Text></View>
              <Text style={styles.userName}>{userData.nome}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
            </View>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.configItem} onPress={() => { setIsProfileVisible(false); router.push('/profile'); }}>
              <View style={styles.configItemLeft}>
                <View style={styles.configIconBox}><User color="#1E293B" size={22} /></View>
                <View><Text style={styles.configItemTitle}>Minha Conta</Text><Text style={styles.configItemSub}>Dados Pessoais</Text></View>
              </View>
              <ChevronRight color="#1E293B" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnSignOut, { marginTop: 25 }]} onPress={handleLogout}>
              <LogOut color="#EF4444" size={20} /><Text style={styles.btnSignOutText}>Sair da conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomTab}>
        <TabItem icon={<FileText size={24} color="#2563EB" />} active />
        <TabItem icon={<Building2 size={24} color="#64748B" />} onPress={() => router.push('/ambientes')} />
        <TabItem icon={<Zap size={24} color="#64748B" />} onPress={() => router.push('/perifericos')} />
        <TabItem icon={<Bell size={24} color="#64748B" />} onPress={() => router.push('/notificacao')} />
        <TabItem icon={<BarChart3 size={24} color="#64748B" />} onPress={() => router.push('/relatorios')} />
      </View>
    </SafeAreaView>
  );
}

// --- ESTILOS E COMPONENTES AUXILIARES ---
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
  actionRow: { flexDirection: 'row', gap: 12, marginVertical: 10, paddingHorizontal: 20 },
  btnSecondary: { flex: 1, height: 45, backgroundColor: '#FFF', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  btnPrimary: { flex: 1.5, height: 45, backgroundColor: '#2563EB', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSecondaryText: { fontWeight: '600', color: '#000' },
  btnPrimaryText: { fontWeight: '600', color: '#FFF' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, gap: 12 },
  metricCard: { width: (width / 2) - 26, height: 140, backgroundColor: '#FFF', borderRadius: 22, padding: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  metricHeader: { marginBottom: 10 },
  metricIcon: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  metricLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  metricValue: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  metricUnit: { fontSize: 12, color: '#94A3B8' },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginTop: 20, marginHorizontal: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  sectionTitleCenter: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 10 },
  gaugeContainer: { alignItems: 'center', justifyContent: 'center', height: 180 },
  gaugeTextOverlay: { position: 'absolute', alignItems: 'center' },
  gaugeValue: { fontSize: 38, fontWeight: 'bold', color: '#1E293B' },
  gaugeLabel: { fontSize: 12, color: '#94A3B8' },
  statusText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  statusSub: { fontSize: 11, color: '#94A3B8', textAlign: 'center' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15, paddingHorizontal: 20 },
  viewAll: { color: '#2563EB', fontWeight: '600' },
  roomCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', marginHorizontal: 20 },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  roomInfoMain: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roomIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center' },
  roomName: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  roomType: { fontSize: 11, color: '#64748B' },
  roomMetrics: { flexDirection: 'row', justifyContent: 'space-between' },
  roomMetricItem: { alignItems: 'center', gap: 2 },
  roomMetricValue: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  roomMetricLabel: { fontSize: 10, color: '#94A3B8' },
  bottomTab: { position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#FFF', flexDirection: 'row', borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: 15 },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeIndicator: { position: 'absolute', bottom: 10, width: 4, height: 4, borderRadius: 2, backgroundColor: '#2563EB' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row' },
  modalBackdrop: { flex: 0.15 },
  profileSheet: { flex: 0.85, backgroundColor: '#FFF', padding: 24, paddingTop: 60, borderTopLeftRadius: 30, borderBottomLeftRadius: 30 },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  profileTitle: { fontSize: 22, fontWeight: 'bold' },
  profileUserInfo: { alignItems: 'center', marginBottom: 20 },
  largeAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  largeAvatarText: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { fontSize: 13, color: '#64748B' },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  configItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  configItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  configIconBox: { width: 40, height: 40, backgroundColor: '#F8FAFC', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  configItemTitle: { fontSize: 15, fontWeight: '600' },
  configItemSub: { fontSize: 11, color: '#94A3B8' },
  btnSignOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#EF4444', borderRadius: 12, height: 50 },
  btnSignOutText: { color: '#EF4444', fontWeight: 'bold' }
});

function MetricCard({ label, value, unit, icon, iconBg }: any) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, {backgroundColor: iconBg}]}>{icon}</View>
      </View>
      <View>
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={styles.metricValueRow}>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricUnit}>{unit}</Text>
        </View>
      </View>
    </View>
  );
}

function RoomCard({ name, type, temp, hum, aqi, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.roomCard} onPress={onPress}>
      <View style={styles.roomHeader}>
        <View style={styles.roomInfoMain}>
          <View style={styles.roomIconBox}>{icon}</View>
          <View><Text style={styles.roomName}>{name}</Text><Text style={styles.roomType}>{type}</Text></View>
        </View>
        <ChevronRight color="#64748B" size={18} />
      </View>
      <View style={styles.roomMetrics}>
        <View style={styles.roomMetricItem}><Thermometer size={14} color="#EF4444" /><Text style={styles.roomMetricValue}>{temp}</Text><Text style={styles.roomMetricLabel}>Temp</Text></View>
        <View style={styles.roomMetricItem}><Droplets size={14} color="#3B82F6" /><Text style={styles.roomMetricValue}>{hum}</Text><Text style={styles.roomMetricLabel}>Umidade</Text></View>
        <View style={styles.roomMetricItem}><Wind size={14} color="#10B981" /><Text style={styles.roomMetricValue}>{aqi}</Text><Text style={styles.roomMetricLabel}>CO₂</Text></View>
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