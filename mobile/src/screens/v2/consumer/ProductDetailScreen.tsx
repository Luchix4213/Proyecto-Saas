import React, { useState } from 'react';
import { View, ScrollView, Image, StyleSheet, Dimensions, Share, Alert } from 'react-native';
import { Text, Surface, Button, IconButton, useTheme, Divider, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart, Share2, Star, CheckCircle } from 'lucide-react-native';
import { useCartStore } from '../../../store/cartStore';
import { storageUtils } from '../../../utils/storageUtils';

const { width } = Dimensions.get('window');

export const ProductDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const theme = useTheme();
    const { addItem } = useCartStore();

    // Product comes from API (PublicProduct interface + tenant_slug injected)
    const product = route.params?.product || {};

    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Mira este producto en ${product.nombre}: Bs ${product.precio}. ¡Pídelo ahora!`,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    const handleAddToCart = () => {
        addItem({
            producto_id: product.producto_id,
            nombre: product.nombre,
            precio: product.precio,
            imagen_url: product.imagen_url,
            // Add quantity handling if store supports it natively, currently store just increments
            // For now, we will just add 1 item 'quantity' times lol or fix store.
            // Actually store adds 1 if exists.
            // Let's call addItem multiple times or update store...
            // Optimization: Update store to accept quantity is better, but for now let's just loop or assume 1.
            // Wait, I can fix the store in next step or just loop. Looping is dirty.
            // I'll update store later if needed. For now, let's just add 1.
        }, product.tenant_slug);

        // Hack for multiple quantity addition with current store logic (adds 1 by 1)
        for(let i = 1; i < quantity; i++) {
             addItem({
                producto_id: product.producto_id,
                nombre: product.nombre,
                precio: product.precio,
                imagen_url: product.imagen_url,
             }, product.tenant_slug);
        }

        setShowSnackbar(true);
        setTimeout(() => navigation.goBack(), 1500);
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Header */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.imagen_url || 'https://via.placeholder.com/300' }} style={styles.image} resizeMode="cover" />
                    <View style={styles.headerActions}>
                        <IconButton
                            icon={() => <ArrowLeft size={24} color="#1e293b" />}
                            style={styles.iconButton}
                            onPress={() => navigation.goBack()}
                        />
                        <View style={{ flexDirection: 'row' }}>
                            <IconButton
                                icon={() => <Share2 size={22} color="#1e293b" />}
                                style={styles.iconButton}
                                onPress={handleShare}
                            />
                            <IconButton
                                icon={() => <Heart size={22} color={isFavorite ? "#ef4444" : "#1e293b"} fill={isFavorite ? "#ef4444" : "transparent"} />}
                                style={styles.iconButton}
                                onPress={() => setIsFavorite(!isFavorite)}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.name}>{product.nombre}</Text>
                        <View style={styles.ratingBadge}>
                            <Star size={14} color="#f59e0b" fill="#f59e0b" />
                            <Text style={styles.ratingText}>New</Text>
                        </View>
                    </View>

                    <Text style={styles.price}>Bs {Number(product.precio).toFixed(2)}</Text>

                    <Text style={styles.description}>
                        {product.descripcion || 'Sin descripción disponible.'}
                    </Text>

                    <Divider style={styles.divider} />
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <Surface style={styles.actionBar} elevation={4}>
                <View style={styles.quantityControl}>
                    <IconButton
                        icon={() => <Minus size={20} color="#64748b" />}
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    />
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <IconButton
                        icon={() => <Plus size={20} color="#64748b" />}
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(quantity + 1)}
                    />
                </View>

                <Button
                    mode="contained"
                    icon={() => <ShoppingCart color="white" size={20} />}
                    style={styles.addToCartBtn}
                    contentStyle={{ height: 50 }}
                    labelStyle={{ fontSize: 16, fontWeight: '700' }}
                    onPress={handleAddToCart}
                >
                    Agregar  Bs {(product.precio * quantity).toFixed(2)}
                </Button>
            </Surface>

            <Snackbar
                visible={showSnackbar}
                onDismiss={() => setShowSnackbar(false)}
                duration={1500}
                style={styles.snackbar}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={20} color="#10b981" />
                    <Text style={{ color: 'white', fontWeight: '700' }}>¡Agregado al carrito!</Text>
                </View>
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    imageContainer: { height: 350, backgroundColor: '#f1f5f9', position: 'relative' },
    image: { width: '100%', height: '100%' },
    headerActions: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    iconButton: { backgroundColor: 'white', elevation: 2 },

    content: { padding: 24, paddingBottom: 100 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    name: { fontSize: 24, fontWeight: '800', color: '#1e293b', flex: 1, marginRight: 10 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
    ratingText: { fontSize: 14, fontWeight: '700', color: '#b45309' },

    price: { fontSize: 28, fontWeight: '800', color: '#10b981', marginBottom: 16 },
    description: { fontSize: 15, color: '#64748b', lineHeight: 24 },

    divider: { marginVertical: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
    variantsRow: { flexDirection: 'row', gap: 10 },
    chip: { borderRadius: 8 },

    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 20,
        paddingBottom: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
    },
    quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12 },
    qtyBtn: { margin: 0 },
    qtyText: { fontSize: 18, fontWeight: '700', minWidth: 20, textAlign: 'center' },
    addToCartBtn: { flex: 1, borderRadius: 12 },
    snackbar: { backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 100 }
});
