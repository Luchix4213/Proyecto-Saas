import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface ProductCardProps {
  nombre: string;
  precio: number;
  stock: number;
  imagen_url?: string;
}

export const ProductCard = ({ nombre, precio, stock, imagen_url }: ProductCardProps) => {
  return (
    <View style={styles.card}>
      {imagen_url ? (
        <Image source={{ uri: imagen_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>Sin imagen</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{nombre}</Text>
        <Text style={styles.price}>
          ${typeof precio === 'number' ? precio.toFixed(2) : Number(precio || 0).toFixed(2)}
        </Text>
        <Text style={[styles.stock, stock <= 5 ? styles.lowStock : null]}>
          Stock: {stock}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#999',
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  stock: {
    fontSize: 14,
    color: '#666',
  },
  lowStock: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
});
