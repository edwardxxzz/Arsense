import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, ArrowRight, Eye, EyeOff, User, Building } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// --- FIREBASE IMPORTS ---
import { auth, database } from '../services/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { ref, set } from "firebase/database";

const LogoImg = require('../assets/images/logo.png');

export default function LoginScreen() {
  const router = useRouter();
  const [tab, setTab] = useState('Entrar');
  const [cadStep, setCadStep] = useState(1);
  
  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI States
  const [secureText, setSecureText] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [hasLoginError, setHasLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validações
  const isEmailValid = (text: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
  const isStep1Complete = fullName.trim().length >= 2 && isEmailValid(email) && company.trim().length >= 1;
  const isStep2Complete = password.length >= 8 && password === confirmPassword && agreeTerms;

  // --- FUNÇÃO DE CADASTRO ---
  const handleSignUp = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. Criar no Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Preparar Nome (Remover caracteres proibidos pelo Firebase: . # $ [ ])
      const safeName = fullName.trim().replace(/[.#$[\]]/g, "_");

      // 3. Gravar no Database seguindo sua estrutura: empresas/fmm/usuarios/
      await set(ref(database, `empresas/fmm/usuarios/${safeName}`), {
        email: email.toLowerCase().trim(),
        empresa: company.trim(),
        uid: uid,
        dataCriacao: new Date().toISOString()
      });

      Alert.alert("Sucesso", "Conta criada com sucesso!");
      router.replace('/home');
      
    } catch (error: any) {
      console.error(error);
      let mensagem = "Erro ao realizar cadastro.";
      
      if (error.code === 'auth/email-already-in-use') mensagem = "Este e-mail já está em uso.";
      if (error.code === 'auth/invalid-email') mensagem = "E-mail inválido.";
      if (error.code === 'auth/weak-password') mensagem = "A senha deve ter pelo menos 6 caracteres.";
      
      Alert.alert("Ops!", mensagem);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNÇÃO DE LOGIN ---
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/home');
    } catch (error) {
      setHasLoginError(true);
      Alert.alert("Erro", "E-mail ou senha incorretos.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Image source={LogoImg} style={styles.logo} resizeMode="contain" />

          <View style={styles.navBar}>
            {['Entrar', 'Cadastrar'].map((item) => (
              <Pressable 
                key={item} 
                onPress={() => { setTab(item); setCadStep(1); }} 
                style={[styles.navItem, tab === item && styles.navItemActive]}
              >
                <Text style={[styles.navText, tab === item && styles.navTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          {tab === 'Entrar' ? (
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputGroup, hasLoginError && styles.inputError]}>
                <Mail color="#000" size={20} />
                <TextInput style={styles.input} placeholder="seu@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" />
              </View>

              <Text style={styles.label}>Senha</Text>
              <View style={[styles.inputGroup, hasLoginError && styles.inputError]}>
                <Lock color="#000" size={20} />
                <TextInput style={styles.input} placeholder="Sua senha" secureTextEntry={secureText} value={password} onChangeText={setPassword} />
              </View>

              <TouchableOpacity onPress={handleLogin} style={{ marginTop: 20 }}>
                <LinearGradient colors={['#0097B2', '#2B58E2']} style={styles.mainButton}>
                  <Text style={styles.buttonText}>Entrar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              {cadStep === 1 ? (
                <>
                  <Text style={styles.label}>Nome Completo</Text>
                  <View style={styles.inputGroup}><User color="#000" size={20} /><TextInput style={styles.input} placeholder="Nome" value={fullName} onChangeText={setFullName} /></View>
                  <Text style={styles.label}>Email Corporativo</Text>
                  <View style={styles.inputGroup}><Mail color="#000" size={20} /><TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" /></View>
                  <Text style={styles.label}>Empresa</Text>
                  <View style={styles.inputGroup}><Building color="#000" size={20} /><TextInput style={styles.input} placeholder="Empresa" value={company} onChangeText={setCompany} /></View>
                  
                  <TouchableOpacity disabled={!isStep1Complete} onPress={() => setCadStep(2)} style={{ marginTop: 20 }}>
                    <LinearGradient colors={['#0097B2', '#2B58E2']} style={[styles.mainButton, !isStep1Complete && { opacity: 0.5 }]}>
                      <Text style={styles.buttonText}>Próximo</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Senha (min. 8 caracteres)</Text>
                  <View style={styles.inputGroup}><Lock color="#000" size={20} /><TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} /></View>
                  <Text style={styles.label}>Confirmar Senha</Text>
                  <View style={styles.inputGroup}><Lock color="#000" size={20} /><TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} /></View>

                  <TouchableOpacity style={styles.termsRow} onPress={() => setAgreeTerms(!agreeTerms)}>
                    <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                      {agreeTerms && <View style={styles.innerCheck} />}
                    </View>
                    <Text style={styles.termsText}>Aceito os termos de uso</Text>
                  </TouchableOpacity>

                  <View style={styles.dualButtons}>
                    <TouchableOpacity style={styles.btnBack} onPress={() => setCadStep(1)}>
                      <Text style={styles.btnBackText}>Voltar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.btnFinish} 
                      disabled={!isStep2Complete || isLoading} 
                      onPress={handleSignUp}
                    >
                      <LinearGradient colors={['#0097B2', '#2B58E2']} style={[styles.gradientFinish, (!isStep2Complete || isLoading) && { opacity: 0.5 }]}>
                        <Text style={styles.buttonText}>{isLoading ? "Criando..." : "Finalizar"}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 25, alignItems: 'center' },
  logo: { width: 120, height: 120, marginBottom: 20 },
  navBar: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 5, marginBottom: 20, width: '100%' },
  navItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  navItemActive: { backgroundColor: '#FFF' },
  navText: { color: '#64748B', fontWeight: '600' },
  navTextActive: { color: '#1E293B' },
  form: { width: '100%' },
  label: { color: '#1E293B', fontWeight: '600', marginBottom: 8, marginTop: 15 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 15, height: 50 },
  input: { flex: 1, marginLeft: 10, color: '#1E293B' },
  inputError: { borderColor: '#ef4444' },
  mainButton: { height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#0097B2', borderRadius: 6, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#0097B2' },
  innerCheck: { width: 10, height: 10, backgroundColor: '#FFF', borderRadius: 2 },
  termsText: { color: '#64748B' },
  dualButtons: { flexDirection: 'row', gap: 10, marginTop: 25 },
  btnBack: { flex: 1, height: 50, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnBackText: { color: '#64748B', fontWeight: '600' },
  btnFinish: { flex: 2 },
  gradientFinish: { height: '100%', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }
});