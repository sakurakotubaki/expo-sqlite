import {
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import React from 'react';
import TodoApp from './TodoApp';
import { migrateDbIfNeeded } from './action/migrateDbIfNeeded';

export default function App() {
  return (
    <SQLiteProvider databaseName="todo.db" onInit={migrateDbIfNeeded}>
      <SafeAreaView style={styles.container}>
        <TodoApp />
      </SafeAreaView>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
});