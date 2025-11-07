'use client'

import { AnimatedModal } from '@/components/ui/modal'
import { NutritionFacts } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface NutritionFactsModalProps {
  isOpen: boolean
  onClose: () => void
  nutritionFacts: NutritionFacts | null
  ingredients: string[]
  allergens: string[]
  productName: string
  accentColor?: string
}

export function NutritionFactsModal({
  isOpen,
  onClose,
  nutritionFacts,
  ingredients,
  allergens,
  productName,
  accentColor = '#fe90b8'
}: NutritionFactsModalProps) {
  return (
    <AnimatedModal 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h2 
            className="text-2xl font-bold"
            style={{ color: accentColor }}
          >
            Nutrition Facts
          </h2>
          <p className="text-sm text-gray-600 mt-1">{productName}</p>
        </div>

        {/* Nutrition Facts Table */}
        {nutritionFacts && (
          <div className="bg-white border-2 border-black p-4">
            <div className="border-b-8 border-black pb-2 mb-2">
              <h3 className="text-3xl font-black">Nutrition Facts</h3>
              <p className="text-sm">
                Servings per container: <span className="font-bold">{nutritionFacts.servings}</span>
              </p>
            </div>

            <div className="border-b-4 border-black py-2">
              <p className="text-xs font-bold">Amount per serving</p>
              <div className="flex justify-between items-end">
                <span className="text-4xl font-black">Calories</span>
                <span className="text-4xl font-black">{nutritionFacts.calories}</span>
              </div>
            </div>

            <div className="border-b border-black py-1">
              <p className="text-xs font-bold text-right">% Daily Value*</p>
            </div>

            <div className="space-y-1">
              <NutritionRow 
                label="Total Fat" 
                value={nutritionFacts.fat}
                isBold
              />
              <NutritionRow 
                label="Total Carbohydrate" 
                value={nutritionFacts.carbs}
                isBold
              />
              <NutritionRow 
                label="Protein" 
                value={nutritionFacts.protein}
                isBold
              />
              <div className="border-t-4 border-black pt-1">
                <NutritionRow 
                  label="Sodium" 
                  value={nutritionFacts.sodium}
                  isBold
                />
              </div>
            </div>

            <div className="border-t-4 border-black pt-2 mt-2">
              <p className="text-xs leading-tight">
                * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 
                2,000 calories a day is used for general nutrition advice.
              </p>
            </div>
          </div>
        )}

        {/* Ingredients Section */}
        {ingredients && ingredients.length > 0 && (
          <div>
            <h3 
              className="text-lg font-bold mb-3"
              style={{ color: accentColor }}
            >
              Ingredients
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                {ingredients.join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Allergens Section */}
        {allergens && allergens.length > 0 && (
          <div>
            <h3 
              className="text-lg font-bold mb-3"
              style={{ color: accentColor }}
            >
              Allergen Information
            </h3>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-sm font-semibold text-orange-900 mb-2">
                Contains:
              </p>
              <div className="flex flex-wrap gap-2">
                {allergens.map((allergen, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full border border-orange-300"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!nutritionFacts && (!ingredients || ingredients.length === 0) && (!allergens || allergens.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Nutritional information is not available for this product.
            </p>
          </div>
        )}
      </div>
    </AnimatedModal>
  )
}

// Helper component for nutrition rows
interface NutritionRowProps {
  label: string
  value: string
  isBold?: boolean
  isIndented?: boolean
}

function NutritionRow({ label, value, isBold = false, isIndented = false }: NutritionRowProps) {
  return (
    <div className={cn(
      "flex justify-between items-center py-1 border-b border-gray-300",
      isIndented && "pl-4"
    )}>
      <span className={cn(
        "text-sm",
        isBold ? "font-bold" : "font-normal"
      )}>
        {label}
      </span>
      <span className={cn(
        "text-sm",
        isBold ? "font-bold" : "font-normal"
      )}>
        {value}
      </span>
    </div>
  )
}
