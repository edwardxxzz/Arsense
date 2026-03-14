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
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { 
  Bell, Plus, Zap, Building2, BarChart3, FileText,
  X, User, LogOut, Snowflake, Sun, Wind, MoreVertical, ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router'; 

// --- INCLUSÃO FIREBASE ---
import { auth, database } from '../services/firebaseConfig';
import { ref, onValue, update } from "firebase/database";
import { signOut } from "firebase/auth";

const { width } = Dimensions.get('window');
const LogoImg = require('../assets/images/logo.png'); 

// Interface para tipar os periféricos encontrados
interface PerifericoData {
  id: string;
  nome: string;
  tipo: string;
  localizacao: string;
  marca: string;
  status: boolean;
  dbPath: string; // Caminho exato no Firebase para o update
}

export default function PerifericosScreen() {
  const router = useRouter();
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [perifericos, setPerifericos] = useState<PerifericoData[]>([]);
  const [userData, setUserData] = useState({ nome: 'Carregando...', email: '', iniciais: '..' });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const empresasRef = ref(database, 'empresas');
      
      onValue(empresasRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          let nomeEncontrado = user.displayName || "Usuário";
          let listaPerifericos: PerifericoData[] = [];
          
          Object.keys(data).forEach(empresaKey => {
            const empresaNode = data[empresaKey];
            const usuarios = empresaNode.usuarios;

            if (usuarios && Object.values(usuarios).some((u: any) => u.uid === user.uid)) {
              // Pega nome do usuário para o perfil
              Object.keys(usuarios).forEach(uk => {
                if (usuarios[uk].uid === user.uid) nomeEncontrado = uk.replace(/_/g, ' ');
              });

              // Busca periféricos dentro de cada ambiente
              const ambientesNode = empresaNode.ambientes;
              if (ambientesNode) {
                Object.keys(ambientesNode).forEach(ambKey => {
                  const perifericosNode = ambientesNode[ambKey].perifericos;
                  
                  if (perifericosNode) {
                    // Ex: ar_condicionado, iluminacao...
                    Object.keys(perifericosNode).forEach(tipoKey => {
                      const modelos = perifericosNode[tipoKey];
                      
                      // Ex: geral, modelo_x...
                      Object.keys(modelos).forEach(modKey => {
                        const item = modelos[modKey];
                        listaPerifericos.push({
                          id: `${ambKey}_${modKey}`,
                          nome: modKey.replace(/_/g, ' '),
                          tipo: tipoKey.replace(/_/g, ' '),
                          localizacao: ambKey.replace(/_/g, ' '),
                          marca: item.marca || "Genérico",
                          status: !!item.status,
                          dbPath: `empresas/${empresaKey}/ambientes/${ambKey}/perifericos/${tipoKey}/${modKey}`
                        });
                      });
                    });
                  }
                });
              }
            }
          });

          const iniciais = nomeEncontrado.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').slice(0, 2).toUpperCase();
          setUserData({ nome: nomeEncontrado, email: user.email || "", iniciais });
          setPerifericos(listaPerifericos);
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
          <Text style={styles.headerTitle}>Periféricos</Text>
          <Text style={styles.headerSubtitle}>Controle seus dispositivos conectados</Text>
        </View>

        <TouchableOpacity style={styles.btnNewItem} onPress={() => router.push('/add_periferico')}>
          <Plus color="#FFF" size={20} />
          <Text style={styles.btnNewItemText}>Novo Periférico</Text>
        </TouchableOpacity>

        {perifericos.map((p) => (
          <PeripheralCard 
            key={p.id}
            title={p.nome}
            subtitle={p.tipo}
            location={p.localizacao}
            brand={p.marca}
            status={p.status}
            dbPath={p.dbPath}
            icon={p.tipo.toLowerCase().includes('ar') ? <Snowflake color="#06B6D4" size={24}/> : <Sun color="#06B6D4" size={24}/>}
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
        <TabItem icon={<FileText size={24} color="#64748B" />} onPress={() => router.push('/home')} />
        <TabItem icon={<Building2 size={24} color="#64748B" />} onPress={() => router.push('/ambientes')} />
        <TabItem icon={<Zap size={24} color="#2563EB" />} active />
        <TabItem icon={<Bell size={24} color="#64748B" />} onPress={() => router.push('/notificacao')} />
        <TabItem icon={<BarChart3 size={24} color="#64748B" />} onPress={() => router.push('/relatorios')} />
      </View>
    </SafeAreaView>
  );
}

// --- CARD COM LÓGICA DE DELAY DE 10S ---
function PeripheralCard({ title, subtitle, location, brand, icon, status, dbPath }: any) {
  const [loading, setLoading] = useState(false);

  const toggleSwitch = async () => {
    if (loading) return; // Evita múltiplos cliques durante o delay

    setLoading(true);

    // Delay de 10 segundos
    setTimeout(async () => {
      try {
        const newStatus = !status;
        await update(ref(database, dbPath), { status: newStatus });
      } catch (error) {
        Alert.alert("Erro", "Falha ao atualizar dispositivo.");
      } finally {
        setLoading(false);
      }
    }, 10000);
  };

  return (
    <View style={styles.peripheralCard}>
      <View style={styles.peripheralHeader}>
        <View style={styles.peripheralInfoMain}>
          <View style={styles.peripheralIconBox}>{icon}</View>
          <View style={{flex: 1}}>
            <Text style={styles.peripheralTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.peripheralSubtitle}>{subtitle}</Text>
          </View>
          {loading && <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 10 }} />}
          <TouchableOpacity><MoreVertical color="#1E293B" size={20}/></TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardSeparator} />
      <View style={styles.peripheralFooter}>
        <View>
          <Text style={styles.locationText}>{location}</Text>
          <Text style={styles.brandText}>{brand}</Text>
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.statusText, {color: status ? '#2563EB' : '#94A3B8'}]}>
            {loading ? 'Aguarde...' : (status ? 'Ligado' : 'Desligado')}
          </Text>
          <Switch 
            trackColor={{ false: "#E2E8F0", true: "#DBEAFE" }} 
            thumbColor={status ? "#2563EB" : "#94A3B8"} 
            onValueChange={toggleSwitch} 
            value={status}
            disabled={loading}
          />
        </View>
      </View>
    </View>
  );
}

// ... TabItem e Styles permanecem iguais aos seus
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
  btnNewItem: { backgroundColor: '#2563EB', height: 48, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 25 },
  btnNewItemText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  peripheralCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  peripheralHeader: { marginBottom: 15 },
  peripheralInfoMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  peripheralIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#E0F7FA', justifyContent: 'center', alignItems: 'center' },
  peripheralTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', flex: 1 },
  peripheralSubtitle: { fontSize: 12, color: '#64748B' },
  cardSeparator: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 15 },
  peripheralFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  brandText: { fontSize: 11, color: '#94A3B8' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusText: { fontSize: 13, fontWeight: '600' },
  bottomTab: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 75, backgroundColor: '#FFF', flexDirection: 'row', borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: 15 },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeIndicator: { position: 'absolute', bottom: 10, width: 4, height: 4, borderRadius: 2, backgroundColor: '#2563EB' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row' },
  modalBackdrop: { flex: 0.15 },
  profileSheet: { flex: 0.85, backgroundColor: '#FFF', padding: 24, paddingTop: 60, borderTopLeftRadius: 30, borderBottomLeftRadius: 30 },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  profileTitle: { fontSize: 24, fontWeight: 'bold' },
  profileUserInfo: { alignItems: 'center', marginBottom: 20 },
  largeAvatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  largeAvatarText: { color: '#FFF', fontSize: 30, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#64748B' },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 25 },
  configLabel: { fontSize: 14, color: '#94A3B8', marginBottom: 20 },
  configItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  configItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  configIconBox: { width: 45, height: 45, backgroundColor: '#F8FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  configItemTitle: { fontSize: 16, fontWeight: '600' },
  configItemSub: { fontSize: 12, color: '#94A3B8' },
  btnSignOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#EF4444', borderRadius: 15, height: 55 },
  btnSignOutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});