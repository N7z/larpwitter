<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ThrottlesPosting;
use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    use ThrottlesPosting;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:500'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,webp,gif', 'max:5120'],
        ];
    }
}
