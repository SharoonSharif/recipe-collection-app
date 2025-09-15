import { 
  Coffee, Salad, Utensils, Cake, Pizza, Soup, 
  Cookie, Wine, Sandwich 
} from 'lucide-react'

export const CATEGORIES = [
  'Appetizer',
  'Main Course',
  'Dessert',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Soup',
  'Salad',
  'Beverage'
] as const

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const

export const categoryIcons = {
  'Breakfast': Coffee,
  'Lunch': Sandwich,
  'Dinner': Utensils,
  'Dessert': Cake,
  'Appetizer': Pizza,
  'Main Course': Utensils,
  'Soup': Soup,
  'Snack': Cookie,
  'Salad': Salad,
  'Beverage': Wine,
} as const

export const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
} as const

export const ratingLabels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
} as const