import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Trash2, PlusCircle, Edit2 } from 'lucide-react-native';

interface Todo {
    id: number;
    value: string;
    intValue: number;
}

export default function TodoApp() {
    const db = useSQLiteContext();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [currentTodo, setCurrentTodo] = useState<Todo>({ id: 0, value: '', intValue: 0 });
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        const result = await db.getAllAsync('SELECT * FROM todos ORDER BY id DESC');
        setTodos(result as Todo[]);
    };

    const handleAddTodo = async () => {
        if (currentTodo.value.trim()) {
            if (editMode) {
                // Update existing todo
                await db.runAsync('UPDATE todos SET value = ? WHERE id = ?',
                    currentTodo.value,
                    currentTodo.id
                );
            } else {
                // Add new todo
                await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)',
                    currentTodo.value,
                    todos.length + 1
                );
            }

            fetchTodos();
            setModalVisible(false);
            setCurrentTodo({ id: 0, value: '', intValue: 0 });
            setEditMode(false);
        }
    };

    const handleDeleteTodo = async (id: number) => {
        await db.runAsync('DELETE FROM todos WHERE id = ?', id);
        fetchTodos();
    };

    const handleEditTodo = (todo: Todo) => {
        setCurrentTodo(todo);
        setEditMode(true);
        setModalVisible(true);
    };

    const renderTodoItem = ({ item }: { item: Todo }) => (
        <View style={styles.todoItem}>
            <View style={styles.todoTextContainer}>
                <Text style={styles.todoText}>{item.value}</Text>
            </View>
            <View style={styles.todoActions}>
                <TouchableOpacity
                    onPress={() => handleEditTodo(item)}
                    style={styles.actionButton}
                >
                    <Edit2 color="#4a4a4a" size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        if (item.id !== 0) {
                            handleDeleteTodo(item.id);
                        }
                    }}
                    style={styles.actionButton}
                >
                    <Trash2 color="#ff6b6b" size={24} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Todo List</Text>
            </View>

            <FlatList
                data={todos}
                renderItem={renderTodoItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No todos yet. Add a new todo!</Text>
                    </View>
                }
            />

            <TouchableOpacity
                onPress={() => {
                    setCurrentTodo({ id: 0, value: '', intValue: 0 });
                    setEditMode(false);
                    setModalVisible(true);
                }}
                style={styles.fabButton}
            >
                <PlusCircle color="#007bff" size={32} />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {editMode ? 'タスクを編集' : 'タスクを追加'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={currentTodo.value}
                            onChangeText={(text) => setCurrentTodo(prev => ({ ...prev, value: text }))}
                            placeholder="Enter todo item"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>キャンセル</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleAddTodo}
                            >
                                <Text style={styles.buttonText}>保存</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    fabButton: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: '#fff',
        borderRadius: 28,
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4, // Android用の影
        shadowColor: '#000', // iOS用の影
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    todoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    todoTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    todoText: {
        fontSize: 16,
        color: '#333',
    },
    todoActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        marginLeft: 15,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        padding: 10,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f54545',
    },
    saveButton: {
        backgroundColor: '#007bff',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});