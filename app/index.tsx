import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router'; // Importação para navegação

const LogoImg = require('../assets/images/logo.png');

export default function LoginScreen() {
  const router = useRouter(); // Hook de navegação
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('Entrar'); 
  const [secureText, setSecureText] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* LOGO E TITULO */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={LogoImg} 
              style={styles.logoEstilo} 
              resizeMode="contain" 
            />
          </View>
          <Text style={styles.appName}>AirSense</Text>
        </View>

        {/* BARRA DE NAVEGAÇÃO (TAB BAR) */}
        <View style={styles.navBar}>
          {['Entrar', 'Cadastrar', 'Recuperar'].map((item) => (
            <Pressable 
              key={item} 
              onPress={() => setTab(item)}
              style={[styles.navItem, tab === item && styles.navItemActive]}
            >
              <Text style={[styles.navText, tab === item && styles.navTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        {/* TEXTOS DE BOAS-VINDAS DINÂMICOS */}
        <View style={styles.welcomeSection}>
          <Text style={styles.title}>
            {tab === 'Entrar' ? 'Bem-vindo de volta' : tab === 'Cadastrar' ? 'Crie sua conta' : 'Recuperar senha'}
          </Text>
          <Text style={styles.subtitle}>
            {tab === 'Entrar' ? 'Entre na sua conta para continuar' : tab === 'Cadastrar' ? 'Preencha os dados para se registrar' : 'Digite seu e-mail para as instruções'}
          </Text>
        </View>

        {/* FORMULÁRIO */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputGroup}>
            <Mail color="#666" size={20} style={styles.icon} />
            <TextInput 
              style={styles.input} 
              placeholder="seu@email.com" 
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* CAMPOS QUE SÓ APARECEM NO ENTRAR E CADASTRAR */}
          {tab !== 'Recuperar' && (
            <>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Senha</Text>
                {tab === 'Entrar' && (
                  <TouchableOpacity onPress={() => setTab('Recuperar')}>
                    <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputGroup}>
                <Lock color="#64748B" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Sua senha"
                  secureTextEntry={secureText}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                  {secureText ? (
                    <EyeOff color="#64748B" size={20} />
                  ) : (
                    <Eye color="#64748B" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* CHECKBOX (APENAS NO ENTRAR) */}
          {tab === 'Entrar' && (
            <View style={styles.rememberContainer}>
              <TouchableOpacity 
                style={styles.checkbox} 
                onPress={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && <View style={styles.checkboxChecked} />}
              </TouchableOpacity>
              <Text style={styles.rememberText}>Manter conectado</Text>
            </View>
          )}

          {/* BOTÃO PRINCIPAL COM NAVEGAÇÃO */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => tab === 'Entrar' ? router.replace('/home') : console.log('Ação de ' + tab)}
          >
            <LinearGradient colors={['#0097B2', '#2B58E2']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.button}>
              <Text style={styles.buttonText}>
                {tab === 'Entrar' ? 'Entrar' : tab === 'Cadastrar' ? 'Cadastrar' : 'Enviar e-mail'}
              </Text>
              <ArrowRight color="white" size={20} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} /><Text style={styles.dividerText}> ou continue com </Text><View style={styles.divider} />
        </View>

        {/* BOTÃO GOOGLE */}
        <TouchableOpacity style={styles.googleButton}>
          <Image 
            source={require('../assets/images/google_logo.png')} 
            style={styles.googleIcon} 
          />
          <Text style={styles.googleButtonText}>Entrar com Google</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 25, alignItems: 'center' },
  
  navBar: { 
    flexDirection: 'row', 
    width: '100%', 
    backgroundColor: '#F1F5F9', 
    borderRadius: 12, 
    padding: 5, 
    marginBottom: 20 
  },
  navItem: { 
    flex: 1, 
    paddingVertical: 10, 
    alignItems: 'center', 
    borderRadius: 8,
    justifyContent: 'center' 
  },
  navItemActive: { 
    backgroundColor: '#FFFFFF', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2 
  },
  navText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  navTextActive: { color: '#1E293B' },

  welcomeSection: { width: '100%', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { color: '#64748B', marginTop: 5, textAlign: 'center' },

  form: { width: '100%' },
  label: { color: '#1E293B', fontWeight: '600', marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  forgotText: { color: '#0097B2', fontSize: 13 },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  icon: { marginRight: 0 },
  input: { flex: 1, height: 50, color: '#1E293B', marginLeft: 10 },

  button: { flexDirection: 'row', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginRight: 10 },

  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  divider: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { color: '#94A3B8', fontSize: 12 },

  googleButton: { 
    width: '100%', 
    height: 55, 
    borderWidth: 1.5, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
    borderColor: '#000000',
    marginTop: 10, 
  },
  googleButtonText: { color: '#000000', fontWeight: '600', fontSize: 16 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  logoContainer: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  logoEstilo: { width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden' },
  appName: { fontSize: 26, fontWeight: '800', color: '#000000', letterSpacing: -0.5 },
  googleIcon: { width: 20, height: 20, marginRight: 10, resizeMode: 'contain' },
  rememberContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 15, marginBottom: 5 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#0097B2', borderRadius: 4, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { width: 12, height: 12, backgroundColor: '#0097B2', borderRadius: 2 },
  rememberText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
});