import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
  Modal,
  Pressable,
  Alert
} from 'react-native';
import { 
  Bell, 
  Plus, 
  Search,
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
  temperatura: string;
  umidade: string;
  co2: string;
}

export default function AmbientesScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const [ambientes, setAmbientes] = useState<AmbienteData[]>([]);

  const [userData, setUserData] = useState({ 
    nome: 'Carregando...', 
    email: '', 
    iniciais: '..' 
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const empresasRef = ref(database, 'empresas');
      
      onValue(empresasRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          let nomeEncontrado = user.displayName || "Usuário";
          let listaAmbientes: AmbienteData[] = [];
          
          // Percorre as empresas para achar a do usuário
          Object.keys(data).forEach(empresaKey => {
            const empresaNode = data[empresaKey];
            const usuarios = empresaNode.usuarios;

            if (usuarios) {
              const usuarioPertence = Object.values(usuarios).some((u: any) => u.uid === user.uid);
              
              if (usuarioPertence) {
                // Captura o nome correto do usuário para o perfil
                Object.keys(usuarios).forEach(uk => {
                  if (usuarios[uk].uid === user.uid) {
                    nomeEncontrado = uk.replace(/_/g, ' ');
                  }
                });

                // --- LÓGICA CORRIGIDA: "ambientes" com "a" minúsculo ---
                const ambientesNode = empresaNode.ambientes; 

                if (ambientesNode) {
                  Object.keys(ambientesNode).forEach(ambKey => {
                    // ambKey é "Ambiente_1", "Sala_de_Reuniao", etc.
                    const sensores = ambientesNode[ambKey].sensores;

                    listaAmbientes.push({
                      id: ambKey,
                      nomeExibicao: ambKey.replace(/_/g, ' '),
                      // Verifica sensores com fallback para '--'
                      temperatura: sensores?.Temperatura !== undefined ? `${sensores.Temperatura}°` : '--',
                      umidade: sensores?.Umidade !== undefined ? `${sensores.Umidade}%` : '--',
                      co2: sensores?.CO2 !== undefined ? String(sensores.CO2) : '--'
                    });
                  });
                }
              }
            }
          });

          // Atualiza o perfil e a lista de cards
          const iniciais = nomeEncontrado.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').slice(0, 2).toUpperCase();
          setUserData({
            nome: nomeEncontrado,
            email: user.email || "",
            iniciais: iniciais || "US"
          });
          
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

  const ambientesFiltrados = ambientes.filter(amb => 
    amb.nomeExibicao.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      
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
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Ambientes</Text>
          <Text style={styles.headerSubtitle}>Gerencie seus ambientes monitorados</Text>
        </View>

        {/* --- BOTÃO NOVO AMBIENTE REDIRECIONANDO --- */}
        <TouchableOpacity style={styles.btnNewRoom} onPress={() => router.push('/add_ambiente')}>
          <Plus color="#FFF" size={20} />
          <Text style={styles.btnNewRoomText}>Novo Ambiente</Text>
        </TouchableOpacity>

        <Pressable 
          style={[
            styles.searchContainer, 
            isFocused && styles.searchContainerFocused 
          ]} 
          onPress={() => inputRef.current?.focus()}
        >
          <Search color={isFocused ? "#000" : "#64748B"} size={20} />
          <TextInput 
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Buscar ambiente..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </Pressable>

        {ambientesFiltrados.length > 0 ? (
          ambientesFiltrados.map((item) => (
            <RoomDetailCard 
              key={item.id}
              name={item.nomeExibicao} 
              type="Monitorado" 
              temp={item.temperatura} 
              hum={item.umidade} 
              aqi={item.co2} 
              icon={<LayoutGrid color="#059669" size={22}/>} 
              onPress={() => router.push('/ambiente')}
            />
          ))
        ) : (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#94A3B8' }}>Nenhum ambiente encontrado.</Text>
          </View>
        )}

        <View style={{height: 100}} /> 
      </ScrollView>

      {/* --- MODAL PERFIL --- */}
      <Modal animationType="fade" transparent={true} visible={isProfileVisible} onRequestClose={() => setIsProfileVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsProfileVisible(false)} />
          <View style={styles.profileSheet}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileTitle}>Perfil</Text>
              <TouchableOpacity onPress={() => setIsProfileVisible(false)}><X color="#94A3B8" size={30} /></TouchableOpacity>
            </View>
            <View style={{ display: 'none' }}>Ignorar div acidental do sistema</View>
            <View style={styles.profileUserInfo}>
              <View style={styles.largeAvatar}><Text style={styles.largeAvatarText}>{userData.iniciais}</Text></View>
              <Text style={styles.userName}>{userData.nome}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
            </View>
            <View style={styles.separator} />
            <Text style={styles.configLabel}>Configurações</Text>
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
        <TabItem icon={<FileText size={24} color="#64748B" />} onPress={() => router.push('/home')} />
        <TabItem icon={<Building2 size={24} color="#2563EB" />} active />
        <TabItem icon={<Zap size={24} color="#64748B" />} onPress={() => router.push('/perifericos')} />
        <TabItem icon={<Bell size={24} color="#64748B" />} onPress={() => router.push('/notificacao')} />
        <TabItem icon={<BarChart3 size={24} color="#64748B" />} onPress={() => router.push('/relatorios')} />
      </View>
    </SafeAreaView>
  );
}

function RoomDetailCard({ name, type, temp, hum, aqi, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.roomCard} onPress={onPress}>
      <View style={styles.roomHeader}>
        <View style={styles.roomInfoMain}>
          <View style={styles.roomIconBox}>{icon}</View>
          <View><Text style={styles.roomName}>{name}</Text><Text style={styles.roomType}>{type}</Text></View>
        </View>
        <ChevronRight color="#1E293B" size={24} />
      </View>
      <View style={styles.metricsRow}>
        <View style={styles.metricBox}><Thermometer size={18} color="#EF4444" /><Text style={styles.metricValue}>{temp}</Text><Text style={styles.metricLabel}>Temp</Text></View>
        <View style={styles.metricBox}><Droplets size={18} color="#3B82F6" /><Text style={styles.metricValue}>{hum}</Text><Text style={styles.metricLabel}>Umidade</Text></View>
        <View style={styles.metricBox}><Wind size={18} color="#0D9488" /><Text style={styles.metricValue}>{aqi}</Text><Text style={styles.metricLabel}>CO₂</Text></View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topAppBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 5, backgroundColor: '#FFF' },
  topLogo: { width: 140, height: 60 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBadge: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 15 },
  headerSection: { marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  headerSubtitle: { fontSize: 14, color: '#64748B' },
  btnNewRoom: { backgroundColor: '#2563EB', height: 48, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 },
  btnNewRoomText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 25, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  searchContainerFocused: { borderColor: '#000', backgroundColor: '#FFF' },
  searchInput: { flex: 1, height: '90%', fontSize: 15, color: '#1E293B' },
  roomCard: { backgroundColor: '#F0FDF4', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#DCFCE7' },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  roomInfoMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roomIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  roomName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  roomType: { fontSize: 12, color: '#64748B' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  metricBox: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 12, alignItems: 'center', gap: 4 },
  metricValue: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  metricLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  bottomTab: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 75, backgroundColor: '#FFF', flexDirection: 'row', borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: 15 },
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