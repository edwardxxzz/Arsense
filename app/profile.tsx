import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Pressable,
  Dimensions,
  Alert
} from 'react-native';
import { 
  Bell, FileText, Building2, Zap, BarChart3, X, User, LogOut, 
  ChevronRight, Mail, Phone, Briefcase, MapPin, Lock, Camera, Save, Eye, EyeOff
} from 'lucide-react-native';
import { useRouter } from 'expo-router'; 

// --- IMPORTAÇÕES FIREBASE ---
import { updatePassword, deleteUser } from "firebase/auth";
import { auth, database } from '../services/firebaseConfig';
import { ref, get, set, remove } from "firebase/database";

const { width } = Dimensions.get('window');
const LogoImg = require('../assets/images/logo.png'); 

export default function ProfileScreen() {
  const router = useRouter();
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  // Estados dos Campos Pessoais
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  
  // Estados de Senha
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  
  // Visibilidade das Senhas
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Estados de Erro e Feedback
  const [originalData, setOriginalData] = useState<any>(null);
  const [companyError, setCompanyError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [matchError, setMatchError] = useState(false); // Focará apenas na barra de confirmação
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snapshot = await get(ref(database, 'empresas'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          for (let compName in data) {
            const users = data[compName].usuarios;
            for (let userName in users) {
              if (users[userName].uid === user.uid) {
                const userData = users[userName];
                setFullName(userName);
                setEmail(userData.email || user.email);
                setPhone(userData.telefone || '');
                setCompany(compName);
                setLocation(userData.localizacao || '');
                setOriginalData({ compName, userName, ...userData });
                break;
              }
            }
          }
        }
      } catch (error) { console.error(error); }
    };
    loadUserData();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user || !originalData) return;
    setCompanyError(false);
    const safeCompany = company.trim().replace(/[.#$[\]]/g, "_");
    const safeUser = fullName.trim().replace(/[.#$[\]]/g, "_");

    try {
      if (safeCompany !== originalData.compName) {
        const companyCheck = await get(ref(database, `empresas/${safeCompany}`));
        if (!companyCheck.exists()) { setCompanyError(true); return; }
        await remove(ref(database, `empresas/${originalData.compName}/usuarios/${originalData.userName}`));
      }
      await set(ref(database, `empresas/${safeCompany}/usuarios/${safeUser}`), {
        ...originalData,
        email: email.toLowerCase().trim(),
        telefone: phone,
        localizacao: location,
        dataAtualizacao: new Date().toISOString()
      });
      Alert.alert("Sucesso", "Perfil atualizado!");
      setOriginalData({ ...originalData, compName: safeCompany, userName: safeUser });
    } catch (error) { Alert.alert("Erro", "Falha ao salvar."); }
  };

  const handleUpdatePassword = async () => {
    const user = auth.currentUser;
    if (!user || !originalData) return;

    // Reset de estados
    setPassError(false);
    setMatchError(false);
    setSuccessMsg('');

    // 1. Validar Senha Atual
    if (currentPass !== originalData.senha) {
      setPassError(true);
      return;
    }

    // 2. Validar se as novas são iguais (Erro apenas na barra de baixo)
    if (newPass !== confirmNewPass || newPass === '') {
      setMatchError(true);
      return;
    }

    try {
      // Atualiza no Auth
      await updatePassword(user, newPass);
      
      // Atualiza no Database (para manter a senha "original" correta na próxima verificação)
      const userRef = ref(database, `empresas/${originalData.compName}/usuarios/${originalData.userName}/senha`);
      await set(userRef, newPass);

      // Atualiza o estado local para as próximas validações sem precisar relogar
      setOriginalData({ ...originalData, senha: newPass });

      setSuccessMsg('Senha alterada com sucesso!');
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
      
      // Remove a mensagem após 4 segundos
      setTimeout(() => setSuccessMsg(''), 4000);

    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert("Ação Requerida", "Por segurança, saia e entre novamente no app para confirmar sua identidade e mudar a senha.");
      } else {
        Alert.alert("Erro", "Não foi possível atualizar a senha. Tente novamente.");
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert("Excluir Conta", "Tem certeza? Isso apagará seus dados permanentemente.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => {
          const user = auth.currentUser;
          if (user && originalData) {
            try {
              await remove(ref(database, `empresas/${originalData.compName}/usuarios/${originalData.userName}`));
              await deleteUser(user);
              router.replace('/');
            } catch (e) {
                Alert.alert("Erro", "Faça login novamente antes de excluir sua conta por segurança.");
            }
          }
        }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topAppBar}>
        <Image source={LogoImg} style={styles.topLogo} resizeMode="contain" />
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBadge}><Bell color="#000" size={24} /></TouchableOpacity>
          <TouchableOpacity style={styles.avatarCircle} onPress={() => setIsProfileVisible(true)}>
            <Text style={styles.avatarText}>{fullName.substring(0,2).toUpperCase() || 'US'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Dados Pessoais</Text>
          <Text style={styles.headerSubtitle}>Gerencie as informações de perfil</Text>
        </View>

        <View style={styles.cardMain}>
          <InputLabel label="Nome completo" icon={<User size={20} />} value={fullName} onChangeText={setFullName} />
          <InputLabel label="Email" icon={<Mail size={20} />} value={email} onChangeText={setEmail} />
          <InputLabel label="Telefone" icon={<Phone size={20} />} value={phone} onChangeText={setPhone} />
          <InputLabel label="Empresa" icon={<Briefcase size={20} />} value={company} onChangeText={(t:any)=>{setCompany(t); setCompanyError(false)}} error={companyError} />
          {companyError && <Text style={styles.errorMessage}>Esta empresa não existe.</Text>}
          <InputLabel label="Localização" icon={<MapPin size={20} />} value={location} onChangeText={setLocation} />
          <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
            <Save color="#FFF" size={20} /><Text style={styles.btnSaveText}>Salvar alterações</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardMain}>
          <Text style={styles.cardTitle}>Segurança</Text>
          <Text style={styles.cardSubtitle}>Atualize sua senha de acesso</Text>
          
          <InputLabel label="Senha Atual" icon={<Lock size={20} />} value={currentPass} onChangeText={(t:any)=>{setCurrentPass(t); setPassError(false)}} secureTextEntry={!showCurrent} error={passError} showEye onEyePress={()=>setShowCurrent(!showCurrent)} isEyeOpen={showCurrent} />
          
          <InputLabel label="Nova Senha" icon={<Lock size={20} />} value={newPass} onChangeText={(t:any)=>{setNewPass(t);}} secureTextEntry={!showNew} showEye onEyePress={()=>setShowNew(!showNew)} isEyeOpen={showNew} />
          
          <InputLabel label="Confirmar Nova Senha" icon={<Lock size={20} />} value={confirmNewPass} onChangeText={(t:any)=>{setConfirmNewPass(t); setMatchError(false)}} secureTextEntry={!showConfirm} error={matchError} showEye onEyePress={()=>setShowConfirm(!showConfirm)} isEyeOpen={showConfirm} />
          
          {successMsg !== '' && <Text style={styles.successText}>{successMsg}</Text>}
          
          <TouchableOpacity style={styles.btnConfirmPassword} onPress={handleUpdatePassword}>
            <Lock color="#64748B" size={20} /><Text style={styles.btnConfirmPasswordText}>Confirmar Senha</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnDelete} onPress={handleDeleteAccount}>
            <X color="#FFF" size={24} /><Text style={styles.btnDeleteText}>Deletar Conta</Text>
        </TouchableOpacity>
        <View style={{height: 120}} /> 
      </ScrollView>
    </SafeAreaView>
  );
}

function InputLabel({ label, icon, value, onChangeText, secureTextEntry, error, editable=true, showEye, onEyePress, isEyeOpen }: any) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.labelStyle}>{label}</Text>
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused, error && { borderColor: '#EF4444', borderWidth: 2 }]}>
        {React.cloneElement(icon, { color: error ? '#EF4444' : (isFocused ? '#2563EB' : '#64748B') })}
        <TextInput 
          style={styles.textInput} 
          value={value} 
          onChangeText={onChangeText} 
          secureTextEntry={secureTextEntry} 
          editable={editable}
          onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
          {...({ outlineStyle: 'none' } as any)} 
        />
        {showEye && (
          <TouchableOpacity onPress={onEyePress}>
            {isEyeOpen ? <EyeOff size={20} color="#64748B" /> : <Eye size={20} color="#64748B" />}
          </TouchableOpacity>
        )}
      </View>
    </View>
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
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  headerSubtitle: { fontSize: 14, color: '#64748B' },
  cardMain: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', elevation: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 5 },
  cardSubtitle: { fontSize: 12, color: '#64748B', marginBottom: 20 },
  errorMessage: { color: '#EF4444', fontSize: 12, marginTop: -12, marginBottom: 15, fontWeight: '600' },
  successText: { color: '#10B981', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  inputWrapper: { marginBottom: 16 },
  labelStyle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, height: 52, gap: 10 },
  inputContainerFocused: { borderColor: '#000000', borderWidth: 2 },
  textInput: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500', height: '90%', outlineWidth:0, outlineColor:"transparent" },
  btnSave: { backgroundColor: '#2563EB', height: 52, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  btnSaveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnConfirmPassword: { height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFF' },
  btnConfirmPasswordText: { color: '#64748B', fontWeight: 'bold', fontSize: 16 },
  btnDelete: { backgroundColor: '#CC0000', height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  btnDeleteText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});