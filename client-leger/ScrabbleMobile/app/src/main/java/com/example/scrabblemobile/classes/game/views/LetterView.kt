package com.example.scrabblemobile.classes.game.views

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.game.game.board.Letter

class LetterView : View {
    var letter: Letter = Letter("A", 0)
    private val bitmap: Bitmap = BitmapFactory.decodeResource(resources, R.drawable.tuile)
    private val scaledBitmap = Bitmap.createScaledBitmap(bitmap, 100, 100, true)
    var isTouched = false

    constructor(context: Context) : super(context)
    constructor(context: Context, attributeSet: AttributeSet) : super(context, attributeSet)

    fun changeAttributes(letter: Letter) {
        this.letter = letter
        invalidate()
        requestLayout()
    }

    private fun getSquarePaint(): Paint {
        val paint = Paint()
        paint.color = Color.BLUE

        paint.style = Paint.Style.STROKE

        paint.strokeWidth = 15f

        return paint
    }

    private fun getTextPaint(): Paint {
        val paint = Paint()
        paint.color = Color.BLACK
        paint.textSize = 40f
        paint.textAlign = Paint.Align.LEFT
        return paint
    }

    @SuppressLint("DrawAllocation")
    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)
        canvas?.drawBitmap(scaledBitmap, 0f, 0f, null)

        val bounds = Rect()

        val textPaint = getTextPaint()
        textPaint.getTextBounds(letter.char, 0, 1, bounds)

        canvas?.drawText(
            letter.char,
            100f / 2 - bounds.width().toFloat() / 2,
            75f - bounds.height().toFloat() / 2,
            textPaint
        )

        textPaint.textSize = 30f
        textPaint.getTextBounds(letter.value.toString(), 0, 1, bounds)

        if (letter.value < 10) {
            canvas?.drawText(
                letter.value.toString(),
                100f - bounds.width().toFloat() - 5f,
                125f - bounds.height().toFloat() - 10f,
                textPaint
            )
        } else {
            canvas?.drawText(
                letter.value.toString(),
                100f - bounds.width().toFloat() - 30f,
                125f - bounds.height().toFloat() - 10f,
                textPaint
            )
        }

        if (isTouched) {
            canvas?.drawRect(0f, 0f, 100f, 100f, getSquarePaint())
        }
    }
}
