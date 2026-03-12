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
  Pressable,
  Switch,
} from 'react-native';
import { 
  Bell, 
  Plus, 
  Zap, 
  Building2, 
  BarChart3, 
  FileText,
  X,
  User,
  LogOut,
  Snowflake,
  Sun,
  Wind,
  MoreVertical,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router'; 

const { width } = Dimensions.get('window');
const LogoImg = require('../assets/images/logo.png'); 

export default function PerifericosScreen() {
  const router = useRouter();
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- TOP BAR (PADRÃO) --- */}
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
        {/* TÍTULO E SUBTÍTULO */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Periféricos</Text>
          <Text style={styles.headerSubtitle}>Controle seus dispositivos conectados</Text>
        </View>

        {/* BOTÃO NOVO PERIFÉRICO */}
        <TouchableOpacity style={styles.btnNewItem}>
          <Plus color="#FFF" size={20} />
          <Text style={styles.btnNewItemText}>Novo Periférico</Text>
        </TouchableOpacity>

        {/* LISTA DE PERIFÉRICOS CONFORME PROTOTIPAÇÃO */}
        <PeripheralCard 
          title="Ar Condicionado Split 12 000 BTU" 
          subtitle="Ar Condicionado" 
          location="Sala 1"
          brand="LG Dual Inverter"
          icon={<Snowflake color="#06B6D4" size={24}/>} 
        />
        <PeripheralCard 
          title="Ar Condicionado Central" 
          subtitle="Ar Condicionado" 
          location="Escritório 1"
          brand="Carrier VRF"
          icon={<Snowflake color="#06B6D4" size={24}/>} 
        />
        <PeripheralCard 
          title="Iluminação Principal" 
          subtitle="Iluminação" 
          location="Sala 2"
          brand="Philips Hue"
          icon={<Sun color="#06B6D4" size={24}/>} 
        />
        <PeripheralCard 
          title="Purificador de Ar" 
          subtitle="Dispositivo" 
          location="Escritório 2"
          brand="Xiaomi Mi Air Purifier 3H"
          icon={<Wind color="#06B6D4" size={24}/>} 
        />

        <View style={{height: 100}} /> 
      </ScrollView>

      {/* --- MODAL DE PERFIL (MANTIDO INTACTO) --- */}
      <Modal animationType="fade" transparent={true} visible={isProfileVisible} onRequestClose={() => setIsProfileVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsProfileVisible(false)} />
          <View style={styles.profileSheet}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileTitle}>Perfil</Text>
              <TouchableOpacity onPress={() => setIsProfileVisible(false)}><X color="#94A3B8" size={30} /></TouchableOpacity>
            </View>
            <View style={styles.profileUserInfo}>
              <View style={styles.largeAvatar}><Text style={styles.largeAvatarText}>US</Text></View>
              <Text style={styles.userName}>Usuário</Text>
              <Text style={styles.userEmail}>usuario@empresa.com</Text>
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
            <TouchableOpacity style={[styles.btnSignOut, { marginTop: 25 }]} onPress={() => { setIsProfileVisible(false); router.replace('/'); }}>
              <LogOut color="#EF4444" size={20} /><Text style={styles.btnSignOutText}>Sair da conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- BOTTOM TAB --- */}
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

// --- COMPONENTE DO CARD DE PERIFÉRICO ---
function PeripheralCard({ title, subtitle, location, brand, icon }: any) {
  const [isEnabled, setIsEnabled] = useState(true);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={styles.peripheralCard}>
      <View style={styles.peripheralHeader}>
        <View style={styles.peripheralInfoMain}>
          <View style={styles.peripheralIconBox}>{icon}</View>
          <View style={{flex: 1}}>
            <Text style={styles.peripheralTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.peripheralSubtitle}>{subtitle}</Text>
          </View>
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
          <Text style={[styles.statusText, {color: isEnabled ? '#2563EB' : '#94A3B8'}]}>
            {isEnabled ? 'Ligado' : 'Desligado'}
          </Text>
          <Switch
            trackColor={{ false: "#E2E8F0", true: "#DBEAFE" }}
            thumbColor={isEnabled ? "#2563EB" : "#94A3B8"}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </View>
    </View>
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
  btnNewItem: { backgroundColor: '#2563EB', height: 48, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 25 },
  btnNewItemText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // CARDS DE PERIFÉRICOS
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

  // TAB E MODAL
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