package com.example.scrabblemobile.classes.game.views

import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ClipDescription
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabblemobile.R
import com.example.scrabblemobile.classes.game.game.board.Letter
import io.reactivex.rxjava3.subjects.PublishSubject

class AdapterLetterHolder(
    private val dataSet: ArrayList<Letter>,
    private val isExchange: Boolean = false
) :
    RecyclerView.Adapter<AdapterLetterHolder.ViewHolder>() {

    var canDragAndDrop = true
    val lettersTouched: ArrayList<Char> = ArrayList()
    lateinit var isLetterTouchedSubject: PublishSubject<Boolean>

    @SuppressLint("ClickableViewAccessibility")
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val letterView: LetterView

        init {
            // Define click listener for the ViewHolder's View.
            letterView = view.findViewById(R.id.letterView)

            letterView.apply {
                if (!isExchange) {
                    setOnTouchListener { v, motionEvent ->
                        if (motionEvent.actionMasked == MotionEvent.ACTION_DOWN) {
                            if (canDragAndDrop) {
                                // Create a new ClipData.
                                // This is done in two steps to provide clarity. The convenience method
                                // ClipData.newPlainText() can create a plain text ClipData in one step.

                                // Create a new ClipData.Item from the ImageView object's tag.
                                val item = ClipData.Item(v.tag as? CharSequence)

                                // Create a new ClipData using the tag as a label, the plain text MIME type, and
                                // the already-created item. This creates a new ClipDescription object within the
                                // ClipData and sets its MIME type to "text/plain".
                                val dragData = ClipData(
                                    v.tag as? CharSequence,
                                    arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN),
                                    item
                                )

                                // Instantiate the drag shadow builder.
                                val myShadow = SimpleDragShadowBuilder(this)

                                // Start the drag.
                                v.startDragAndDrop(
                                    dragData,  // The data to be dragged
                                    myShadow,  // The drag shadow builder
                                    this,      // No need to use local data
                                    0          // Flags (not currently used, set to 0)
                                )
                            }
                        }
                        true
                    }
                } else {
                    letterView.apply {
                        setOnTouchListener { _, motionEvent ->
                            if (motionEvent.actionMasked == MotionEvent.ACTION_DOWN) {
                                this.isTouched = !isTouched

                                if (this.isTouched) {
                                    lettersTouched.add(this.letter.char[0])
                                } else {
                                    for (i in 0 until lettersTouched.size) {
                                        if (lettersTouched[i] == this.letter.char[0]) {
                                            lettersTouched.removeAt(i)
                                            break
                                        }
                                    }
                                }
                                if (lettersTouched.size > 0) {
                                    isLetterTouchedSubject.onNext(true)
                                } else {
                                    isLetterTouchedSubject.onNext(false)
                                }
                                this.invalidate()
                            }
                            true
                        }
                    }
                }
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.scrabble_tile_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {
        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.letterView.changeAttributes(dataSet[position])
        viewHolder.letterView.isTouched = false
        viewHolder.letterView.tag = position
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = dataSet.size

    fun deleteLetter(position: Int) {
        dataSet.removeAt(position)
        notifyItemRemoved(position)
        notifyItemRangeChanged(position, dataSet.size)
    }

    fun emptyRack() {
        if (dataSet.isEmpty()) {
            return
        }
        val size = dataSet.size
        for (i in 0 until size) {
            deleteLetter(0)
        }
    }
}
